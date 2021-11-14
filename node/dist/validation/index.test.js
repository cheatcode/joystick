import validate from "./index";
import { handleGetInputValue, getArrayPathKey, addToValidationQueue } from "./inputWithSchema";
describe("validate/schema/index.js", () => {
});
describe("validate/inputWithSchema/index.js", () => {
  test("does not throw if process.env.NODE_ENV equals test", () => {
    expect(async () => {
      process.env.NODE_ENV = "test";
      const result = await validate.inputWithSchema({}, {});
    }).not.toThrow();
  });
  test("does not throw if process.env.NODE_ENV does not equal test", () => {
    expect(async () => {
      process.env.NODE_ENV = "production";
      const result = await validate.inputWithSchema({}, {});
    }).not.toThrow();
  });
  test("throws error if input argument is not passed", () => {
    expect(async () => {
      const result = await validate.inputWithSchema();
    }).rejects.toThrow("[joystick.validation] Must pass input.");
  });
  test("addToValidationQueue throws error if queue argument is not an array", () => {
    expect(() => {
      addToValidationQueue(3);
    }).toThrow("queue must be an array");
  });
  test("handleGetInputValue throws error if path argument is not a string", () => {
    expect(() => {
      handleGetInputValue(null, 3, false);
    }).toThrow("path must be passed as a string");
  });
  test("getArrayPathKey returns a string with the name of they key", () => {
    const arrayPathKey = getArrayPathKey("this.is.the.thing");
    expect(arrayPathKey).toEqual("thing");
  });
  test("getArrayPathKey returns a string if arrayPath is undefined", () => {
    const arrayPathKey = getArrayPathKey();
    expect(arrayPathKey).toEqual("");
  });
  test("getArrayPathKey throws error if arrayPath argument is not a string", () => {
    expect(() => {
      getArrayPathKey(5);
    }).toThrow("arrayPath must be a type of string");
  });
  test("returns expected errors when rules.allowedValues validator fails", async () => {
    const errors = await validate.inputWithSchema({
      name: "apples"
    }, {
      name: {
        type: "string",
        allowedValues: ["buy", "more", "bitcoin"]
      }
    });
    expect(errors).toEqual([
      "Field name only allows the following values: buy, more, bitcoin."
    ]);
  });
  test("returns expected errors when nested rules.allowedValues validator fails", async () => {
    const errors = await validate.inputWithSchema({
      name: "apples",
      dog: [
        {
          breed: "Corgi"
        },
        {
          breed: "German Shepherd",
          coats: [{ type: "rough" }]
        },
        {
          breed: "English Bulldog"
        }
      ]
    }, {
      name: {
        type: "string",
        allowedValues: ["buy", "more", "bitcoin"]
      },
      dog: {
        type: "array",
        element: {
          breed: {
            type: "string",
            allowedValues: ["Corgi", "German Shepherd", "Golden Retriever"]
          },
          coats: {
            type: "array",
            element: {
              style: {
                type: "string",
                allowedValues: ["silky", "dry", "smooth"]
              }
            }
          }
        }
      }
    });
    expect(errors).toEqual([
      "Field name only allows the following values: buy, more, bitcoin.",
      "Field dog.1.coats.0.style only allows the following values: silky, dry, smooth.",
      "Field dog.2.breed only allows the following values: Corgi, German Shepherd, Golden Retriever."
    ]);
  });
  test("returns expected errors when rules.element (string) validator fails", async () => {
    const errors = await validate.inputWithSchema({
      birds: [1, 2, 3]
    }, {
      birds: {
        type: "array",
        element: "string"
      }
    });
    expect(errors).toEqual([
      "Field birds.0 must be of type string.",
      "Field birds.1 must be of type string.",
      "Field birds.2 must be of type string."
    ]);
  });
  test("returns expected errors when nested rules.element (string) validator fails", async () => {
    const errors = await validate.inputWithSchema({
      birds: [
        {
          name: "Parrot",
          attributes: {
            colors: ["blue", "green", "red"]
          }
        },
        {
          name: "Snake",
          attributes: {
            colors: ["purple", "orange", "teal"]
          }
        }
      ]
    }, {
      birds: {
        type: "array",
        element: {
          name: {
            type: "string"
          },
          attributes: {
            type: "object",
            fields: {
              colors: {
                type: "array",
                element: "integer"
              }
            }
          }
        }
      }
    });
    expect(errors).toEqual([
      "Field birds.0.attributes.colors.0 must be of type integer.",
      "Field birds.0.attributes.colors.1 must be of type integer.",
      "Field birds.0.attributes.colors.2 must be of type integer.",
      "Field birds.1.attributes.colors.0 must be of type integer.",
      "Field birds.1.attributes.colors.1 must be of type integer.",
      "Field birds.1.attributes.colors.2 must be of type integer."
    ]);
  });
  test("returns expected errors when rules.fields validator is passed value other than object", async () => {
    const errors = await validate.inputWithSchema({
      user: {
        name: 789.456
      }
    }, {
      user: {
        type: "object",
        fields: "no bueno"
      }
    });
    expect(errors).toEqual(["Field user schema rule and input value for element must be of type object."]);
  });
  test("returns expected errors when rules.fields validator fails", async () => {
    const errors = await validate.inputWithSchema({
      user: {
        name: 789.456
      }
    }, {
      user: {
        type: "object",
        fields: {
          name: {
            type: "string"
          }
        }
      }
    });
    expect(errors).toEqual(["Field user.name must be of type string."]);
  });
  test("returns expected errors when rules.max validator fails", async () => {
    const errors = await validate.inputWithSchema({
      price: 39.99
    }, {
      price: {
        type: "float",
        max: 29.99
      }
    });
    expect(errors).toEqual([
      "Field price must be less than or equal to 29.99."
    ]);
  });
  test("returns no errors when rules.max validator returns valid true", async () => {
    const errors = await validate.inputWithSchema({
      price: 39.99
    }, {
      price: {
        type: "float",
        max: 39.99
      }
    });
    expect(errors).toEqual([]);
  });
  test("returns expected errors when rules.min validator fails", async () => {
    const errors = await validate.inputWithSchema({
      price: 19.99
    }, {
      price: {
        type: "float",
        min: 29.99
      }
    });
    expect(errors).toEqual([
      "Field price must be greater than or equal to 29.99."
    ]);
  });
  test("returns expected errors when rules.optional (false) fails", async () => {
    const errors = await validate.inputWithSchema({
      price: 29.99
    }, {
      price: {
        type: "float",
        min: 29.99
      },
      description: {
        type: "string",
        optional: false
      }
    });
    expect(errors).toEqual(["Field description is required."]);
  });
  test("returns no errors when rules.optional (true)", async () => {
    const errors = await validate.inputWithSchema({
      price: 29.99
    }, {
      price: {
        type: "float",
        min: 29.99
      },
      description: {
        type: "string",
        optional: true
      }
    });
    expect(errors).toEqual([]);
  });
  test("returns expected errors when rules.regex fails", async () => {
    const errors = await validate.inputWithSchema({
      arrayPath: "thing.is.not.in.array"
    }, {
      arrayPath: {
        type: "string",
        regex: new RegExp(/\.[0-9]+\.?/g)
      }
    });
    expect(errors).toEqual([
      "Field arrayPath must conform to regex: /\\.[0-9]+\\.?/g."
    ]);
  });
  test("returns no errors when rules.regex returns valid true", async () => {
    const errors = await validate.inputWithSchema({
      arrayPath: ".0."
    }, {
      arrayPath: {
        type: "string",
        regex: new RegExp(/\.[0-9]+\.?/g)
      }
    });
    expect(errors).toEqual([]);
  });
  test("returns expected errors when rules.required (true) fails", async () => {
    const errors = await validate.inputWithSchema({
      price: 29.99
    }, {
      price: {
        type: "float",
        min: 29.99
      },
      description: {
        type: "string",
        required: true
      }
    });
    expect(errors).toEqual(["Field description is required."]);
  });
  test("returns no errors when rules.required (false)", async () => {
    const errors = await validate.inputWithSchema({
      price: 29.99
    }, {
      price: {
        type: "float",
        min: 29.99
      },
      description: {
        type: "string",
        required: false
      }
    });
    expect(errors).toEqual([]);
  });
  test("returns expected errors when rules.type (array) fails", async () => {
    const errors = await validate.inputWithSchema({
      name: "array"
    }, {
      name: {
        type: "array"
      }
    });
    expect(errors).toEqual(["Field name must be of type array."]);
  });
  test("returns expected errors when rules.type (boolean) fails", async () => {
    const errors = await validate.inputWithSchema({
      name: 123
    }, {
      name: {
        type: "boolean"
      }
    });
    expect(errors).toEqual(["Field name must be of type boolean."]);
  });
  test("returns expected errors when rules.type (float) fails", async () => {
    const errors = await validate.inputWithSchema({
      name: 123
    }, {
      name: {
        type: "float"
      }
    });
    expect(errors).toEqual(["Field name must be of type float."]);
  });
  test("returns expected errors when rules.type (integer) fails", async () => {
    const errors = await validate.inputWithSchema({
      name: 123.123
    }, {
      name: {
        type: "integer"
      }
    });
    expect(errors).toEqual(["Field name must be of type integer."]);
  });
  test("returns expected errors when rules.type (number) fails", async () => {
    const errors = await validate.inputWithSchema({
      name: "123.123"
    }, {
      name: {
        type: "number"
      }
    });
    expect(errors).toEqual(["Field name must be of type number."]);
  });
  test("returns expected errors when rules.type (object) fails", async () => {
    const errors = await validate.inputWithSchema({
      name: []
    }, {
      name: {
        type: "object"
      }
    });
    expect(errors).toEqual(["Field name must be of type object."]);
  });
  test("returns expected errors when rules.type (string) fails", async () => {
    const errors = await validate.inputWithSchema({
      name: 123
    }, {
      name: {
        type: "string"
      }
    });
    expect(errors).toEqual(["Field name must be of type string."]);
  });
  test("returns no errors when rules.type (any) is passed", async () => {
    const errors = await validate.inputWithSchema({
      name: 123
    }, {
      name: {
        type: "any"
      }
    });
    expect(errors).toEqual([]);
  });
  test("returns array of errors after validation", async () => {
    const errors = await validate.inputWithSchema({
      name: 12345
    }, {
      name: {
        type: "string"
      }
    });
    expect(errors).toEqual(["Field name must be of type string."]);
  });
});
