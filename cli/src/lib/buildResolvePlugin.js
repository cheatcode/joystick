// TODO: None of these plugin-level methods give us the info we need. They *should*
// but it's not defined (which means at best it's inconsistent).
//
// TODO: Just run a full build of the parent path where the file is located, or,
// build the entire app again. That has an n(0) problem that we'll have to solve
// but I think we can figure it out in time (or invent a custom a solution).

export default function myExample() {
  return {
    name: "joystick-build-resolve", // this name will show up in warnings and errors
    buildEnd() {
      const moduleIds = Array.from(this.getModuleIds());
      const modules = moduleIds
        .map((moduleId) => this.getModuleInfo(moduleId))
        .filter(({ id }) => {
          const ignorePaths = ["node_modules", "dist"];
          const noResolvePaths = ["/ui", "/api"];

          if (
            !ignorePaths.some((path) => id.includes(path)) &&
            noResolvePaths.some((path) => id.includes(path))
          ) {
            return true;
          }

          return false;
        });

      return null;
    },
  };
}
