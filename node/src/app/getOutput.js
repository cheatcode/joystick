import { isObject } from "../validation/lib/typeValidators";

const getOutput = (object = {}, fields = []) => {
  Object.entries(object || {}).forEach(([key, value]) => {
    const keyInFields = fields.find((field) => field.key === key);

    if (!keyInFields) {
      delete object[key];
    }

    if (keyInFields && isObject(value) && keyInFields.children.length === 0) {
      return value;
    }

    if (keyInFields && isObject(value) && keyInFields.children.length > 0) {
      return getOutput(value, keyInFields.children);
    }

    if (
      keyInFields &&
      Array.isArray(value) &&
      keyInFields.children &&
      keyInFields.children.length > 0
    ) {
      value.forEach((valueElement) => {
        if (valueElement && isObject(valueElement)) {
          return getOutput(valueElement, keyInFields.children);
        }
      });
    }
  });

  return object;
};

const getPathPartArrays = (paths = []) => {
  return paths.map((path) => {
    return path.split(".");
  });
};

const getHeadTail = (pathPartArray = []) => {
  const [head, ...tail] = pathPartArray;
  return {
    head,
    tail,
  };
};

const getHeadTailForPaths = (pathPartArrays = []) => {
  return pathPartArrays.map((pathPartArray) => {
    return getHeadTail(pathPartArray);
  });
};

const addToMap = (map = [], headTailForPaths = []) => {
  headTailForPaths.forEach((headTailForPath) => {
    const existingMapEntry = map.find(
      (mapEntry) => mapEntry.key === headTailForPath.head
    );

    if (!existingMapEntry) {
      const headTailForChildren =
        headTailForPath.tail && headTailForPath.tail.length > 0
          ? getHeadTail(headTailForPath.tail)
          : null;
      map.push({
        key: headTailForPath.head,
        children: headTailForChildren
          ? addToMap([], [headTailForChildren])
          : [], // The NEXT thing to nest and the parent.
      });
    }

    if (existingMapEntry) {
      const headTailForChildren =
        headTailForPath.tail && headTailForPath.tail.length > 0
          ? getHeadTail(headTailForPath.tail)
          : null;
      existingMapEntry.children = [
        ...(headTailForChildren
          ? addToMap(existingMapEntry.children, [headTailForChildren])
          : []),
      ];
    }
  });

  return map;
};

export default (output = {}, outputFields = []) => {
  const map = [];
  const pathPartArrays = getPathPartArrays(outputFields);
  const headTailForPaths = getHeadTailForPaths(pathPartArrays);

  addToMap(map, headTailForPaths);

  if (Array.isArray(output)) {
    return output.map((element) => {
      return getOutput(element, map);
    });
  }

  return getOutput(output, map);
};
