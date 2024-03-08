import types from "../../lib/types.js";

class Fixture {
  constructor(options = {}) {
    this.options = options;
    this.quantity = options?.quantity;
    this.run = this.run.bind(this);

    return this.run;
  }

  async run(input = {}) {
    this.input = input;

    const skip = typeof this?.options?.skip === 'function' ? await this.options.skip(this, input) : false;
    
    let data_to_create = [];

    if (!skip) {
      data_to_create = await this.generate_data_to_create(input);

      if (types.is_function(this?.options?.onCreate) || types.is_function(this?.options?.on_create)) {
        await (this.options.onCreate || this.options.on_create)(this, data_to_create, (on_after_create_each_input = {}) => {
          return (this?.options?.onAfterCreateEach || this.options.on_after_create_each)(this, on_after_create_each_input, input);
        });
      }
    }

    if (types.is_function(this?.options?.onAfterCreateAll) || types.is_function(this?.options?.on_after_create_all)) {
      (this.options.onAfterCreateAll || this.options.on_after_create_all)(this, data_to_create, input);
    }
  }

  async generate_data_to_create(input = {}) {
    const data = [];

    for (let i = 0; i < this?.quantity; i += 1) {
      if (typeof this?.options?.template === 'function') {
        const data_to_create = await this.options?.template(this, i, input);
        data.push(data_to_create);
      }
    }

    return data;
  }
}

export default (options = {}) => {
  return new Fixture(options);
}
