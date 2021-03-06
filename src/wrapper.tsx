import * as Core from './coreTypes';
import * as React from 'react';

/**
 * _@core / Form / Wrapper_
 * 
 * ### Wrap a component that has value and onChange
 * ```
 * `
 * sets ${data-name} of component to track onChange
 * adds ${data-error} when there is an error with the input
 * `
 * ```
 * ### Accepted Props
 * ```
 * controller: Core.FormController // instance of FormController
 * validate?: (value) => boolean // optional validation function
 * name: string // the key the value will be under in the controller
 * ```
 */
export default class Wrapper extends React.Component<Core.WrapperProps> implements Core.FormField {
  Context: React.Context<any>;

  validate(value: string, values: any) {
    const { validate } = this.props;
    return validate ? validate(value || '', values) : true;
  }

  componentWillMount() {
    const { controller, children, defaultValue, name } = this.props;
    this.validate = this.validate.bind(this);
    controller && controller.attachComponent(name, this, defaultValue);

    if (!children || typeof children !== 'function') {
      throw Error('children of Wrapper must be a function');
    }
    
  }

  render() {
    const {name, controller, children} = this.props;
    const { Context } = this;
    if (!children) {
      throw Error('children of Wrapper must be a function');
    }
    return (
      <Context.Consumer>
        {state => {
          const { values, errors, onChange } = state;
          let value = controller ? values[name] || '' : undefined;
          let validate = errors[name];
          return children({ value, name, error: validate ? !validate.valid : false, message: validate && validate.message, onChange: e => onChange(e, name)})
        }}
      </Context.Consumer>
    )
  }
}

// export const Wrap = (controller: Core.FormController, W: any = Wrapper) => (
//   (props: typeof W['props'] & { controller?: any}) => (
//     <W {...props} controller={controller} />
//   )
// )

export const Wrap = (controller: Core.FormController, W: React.ComponentType<Core.FormFieldProps<null>> = Wrapper, validator?: Core.ValidateFunc) => {

  return (props: Exclude<Core.ExtractProps<typeof W>, { controller: Core.FormController}>) => (
    <W {...{ validate: validator, ...props}} controller={controller} />
  )
}
