class Fixture {
  constructor(options = {}) {
    this.options = options;
    this.quantity = options?.quantity;
    this.run = this.run.bind(this);
    return this.run;
  }
  async run(input = {}) {
    this.input = input;
    const skip = typeof this?.options?.skip === "function" ? await this.options.skip(this, input) : false;
    let dataToCreate = [];
    if (!skip) {
      dataToCreate = await this.generateDataToCreate(input);
      if (typeof this?.options?.onCreate === "function") {
        await this.options.onCreate(this, dataToCreate, (input2 = {}) => {
          return this?.options?.onAfterCreateEach(this, input2);
        });
      }
    }
    if (typeof this?.options?.onAfterCreateAll === "function") {
      this.options.onAfterCreateAll(this, dataToCreate);
    }
  }
  async generateDataToCreate(input = {}) {
    const data = [];
    for (let i = 0; i < this?.quantity; i += 1) {
      if (typeof this?.options?.template === "function") {
        const dataToCreate = await this.options?.template(this, i, input);
        data.push(dataToCreate);
      }
    }
    return data;
  }
}
var fixture_default = (options = {}) => {
  return new Fixture(options);
};
export {
  fixture_default as default
};
