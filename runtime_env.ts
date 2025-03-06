export enum RuntimeEnv {
    prod = "prod",
    dev = "dev",
    test = "test"
  }

export function getRuntimeEnv(): RuntimeEnv {
  const nodeEnv: string = (process.env.NODE_ENV as string) ?? "dev";
  switch (nodeEnv) {
    case RuntimeEnv.dev:
    case RuntimeEnv.test:
      return RuntimeEnv.dev;
    case RuntimeEnv.prod:
      return RuntimeEnv.prod;
    default:
      throw Error(
        "Runtime environment must be one of `development` or `production`",
      );
  }
}
