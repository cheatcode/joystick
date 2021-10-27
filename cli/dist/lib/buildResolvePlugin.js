function myExample() {
  return {
    name: "joystick-build-resolve",
    buildEnd() {
      const moduleIds = Array.from(this.getModuleIds());
      const modules = moduleIds.map((moduleId) => this.getModuleInfo(moduleId)).filter(({ id }) => {
        const ignorePaths = ["node_modules", "dist"];
        const noResolvePaths = ["/ui", "/api"];
        if (!ignorePaths.some((path) => id.includes(path)) && noResolvePaths.some((path) => id.includes(path))) {
          return true;
        }
        return false;
      });
      return null;
    }
  };
}
export {
  myExample as default
};
