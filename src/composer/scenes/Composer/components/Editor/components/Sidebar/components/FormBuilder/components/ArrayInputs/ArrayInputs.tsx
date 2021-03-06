import { ILooseObject } from '@source/composer/types';
import { Tabs, Icon, Popconfirm, Checkbox } from 'antd';
import * as React from 'react';
import { IFormSchema } from '../../FormBuilder';
import InputRenderer from '../InputRenderer';
import Section from '../Section';
import debounce from 'lodash/debounce';

// tslint:disable:jsx-no-multiline-js
// tslint:disable:jsx-no-lambda

interface IArrayInputsProps {
  title: string;
  name: string;
  data: ILooseObject[];
  items: IFormSchema;
  // tslint:disable-next-line:no-any
  onChange: (e: React.ChangeEvent | any) => void;
  activeTab: number;
}

class ArrayInputs extends React.Component<IArrayInputsProps> {
  constructor(props: IArrayInputsProps) {
    super(props);
    this.onChange = this.onChange.bind(this);
    this.mediaLibraryChange = this.mediaLibraryChange.bind(this);
    this.onChangeTab = debounce(this.onChangeTab.bind(this), 25);
  }

  public onChangeTab(key: number) {
    this.props.onChange({ target: { name: 'activeTab', value: key } });
  }

  public onNewTab() {
    const newData = [...this.props.data];
    newData.push({});

    const newTab = newData.length - 1;

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });

    this.onChangeTab(newTab);
  }

  public onEditTab(targetKey: string, action: string) {
    let iKey = parseInt(targetKey, 10);
    let newData = [...this.props.data];
    let newTab = this.props.activeTab;

    // remove tab

    if (action === 'remove') {
      newData.splice(iKey, 1);

      if (newTab > iKey || iKey === newTab) {
        newTab = newTab - 1;
      }
      if (newTab < 0) {
        newTab = 0;
      }
    }

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });

    this.onChangeTab(newTab);
  }

  // tslint:disable-next-line:no-any
  public onChange(key: any) {
    const newData = [...this.props.data];
    newData[this.props.activeTab][key.target.name] = key.target.value;

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });
  }

  public mediaLibraryChange(media: { value: object; name: string }) {
    const newData = [...this.props.data];
    newData[this.props.activeTab][media.name] = media.value;

    this.props.onChange({
      target: {
        name: this.props.name,
        value: newData,
      },
    });
  }

  public render() {
    // tslint:disable-next-line:no-any
    const onEdit = (targetKey: string | any, action: string) => {
      if (action === 'add') {
        this.onNewTab();
      }
      if (typeof targetKey === 'string') {
        this.onEditTab(targetKey, action);
      }
    };

    return (
      <Section title={this.props.title}>
        <Checkbox
          checked={false}
          disabled={false}
          onChange={this.onChange}
        >
          Dynamic source
        </Checkbox>
        <Tabs
          type="editable-card"
          activeKey={this.props.activeTab.toString()}
          onChange={(key: string) => this.onChangeTab(parseInt(key, 10))}
          onEdit={onEdit}
        >
          {this.props.data &&
            this.props.data.map((dataRow: ILooseObject, index: number) => {
              const tabTitle = (
                <>
                  {index + 1}

                  <Popconfirm
                    title="Are you sure delete this tab?"
                    onConfirm={() => this.onEditTab(index.toString(), 'remove')}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Icon
                      type="close"
                      theme="outlined"
                      style={{ marginLeft: '5px', marginRight: '-13px', fontSize: '.6em' }}
                      className="anticon anticon-close ant-tabs-close-x"
                    />
                  </Popconfirm>
                </>
              );
              return (
                <Tabs.TabPane key={`${index}`} tab={tabTitle} closable={false}>
                  {this.props.items &&
                    this.props.items.properties &&
                    Object.keys(this.props.items.properties).map((elementName: string, j: number) => {
                      const element = this.props.items.properties[elementName];
                      return (
                        <InputRenderer
                          key={j}
                          id={index}
                          name={elementName}
                          {...element}
                          value={
                            this.props.data && this.props.data[index] && this.props.data[index][elementName]
                              ? this.props.data[index][elementName]
                              : null
                          }
                          onChange={this.onChange}
                          mediaLibraryChange={this.mediaLibraryChange}
                        />
                      );
                    })}
                </Tabs.TabPane>
              );
            })}
        </Tabs>
      </Section>
    );
  }
}

export default ArrayInputs;
