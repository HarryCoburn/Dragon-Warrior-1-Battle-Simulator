module.exports = function(config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine"],
    files: ["spec/*.js", "src/*.js"],
    exclude: [],
    preprocessors: {
      "src/*.js": ["coverage"],
      "spec/*.js": ["webpack"]
    },
    reporters: ["progress", "coverage"],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ["Firefox"],
    singleRun: true,
    webpack: {
      mode: "production"
    },
    concurrency: Infinity,
    coverageReporter: {
      dir: "./coverage",
      reporters: [{ type: "lcov", subdir: "." }, { type: "text-summary" }]
    }
  });
};
