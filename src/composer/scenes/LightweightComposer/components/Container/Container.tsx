import { IComponentModule } from '@source/composer/types';
import { Context, addContextInformationsFromDatasourceItems } from '@source/composer/utils';
import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_CONTEXT = gql`{
  datasourceItems @client
}`;

export interface IProperties {
  // tslint:disable-next-line:no-any
  content: any[];
  componentModule: IComponentModule;
}

class Container extends React.Component<IProperties, {}> {

  constructor(props: IProperties) {
    super(props);
  }

  public render() {
    if (!this.props.content || this.props.content.length < 1) {
      return null;
    }

    return (
      <Query query={GET_CONTEXT}>{({ error, loading, data }) => {

        const MappedContent = this.props.content.map((node) => {
          if (node.type === 'container') {
            return (
              <Container
                content={node.content}
                componentModule={this.props.componentModule}
                key={node.id}
              />
            );
          } else {
            const Comp = this.props.componentModule.getComponent(node.name);

            if (error) { return 'Error...'; }
            if (loading) { return 'Loading...'; }
            
            const { datasourceItems } = data;

            const parsedData = addContextInformationsFromDatasourceItems(datasourceItems, node.data);

            console.log(parsedData);
      
            return (
              <Comp
                data={parsedData}
                key={node.id}
              />
            );
          }
        });

        return (
          <div className="layout">
            {...MappedContent}
          </div>
        );
    }}</Query>);
  }
}

export default Container;
