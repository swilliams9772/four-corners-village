/// <reference types="expo/types" />

declare module "*.png" {
  const value: number;
  export default value;
}

declare module "*.jpg" {
  const value: number;
  export default value;
}

declare module "*.svg" {
  import type { FC } from "react";
  import type { SvgProps } from "react-native-svg";
  const Component: FC<SvgProps>;
  export default Component;
}
