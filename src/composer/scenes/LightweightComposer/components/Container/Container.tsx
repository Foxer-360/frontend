import { IComponentModule } from '@source/composer/types';
import { Context } from '@source/composer/utils';
import * as React from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import * as R from 'ramda';

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

            const regex = /%([^%]*)%/g;
            let stringifiedData = JSON.stringify(node.data);
            let replacedData = String(stringifiedData);
            let result;
            
            while (result = regex.exec(stringifiedData) && datasourceItems.length > 0) {
              if (result[1]) {
                try {
                  const searchKeys = result[1].split(',');
                  if (Array.isArray(searchKeys) && searchKeys.length > 0) {
                    const getValueFromDatasourceItems = R.path(searchKeys);
                    const replacement = getValueFromDatasourceItems(datasourceItems[datasourceItems.length - 1].content);
                    if (replacement) {
                      
                      replacedData = replacedData.replace(result[0], replacement);
                    }
                  }    
                } catch (e) {
                  console.log(e);
                }
              }
            }
            
            const parsedData = JSON.parse(replacedData);
      
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
