import '@rneui/themed';

declare module '@rneui/themed' {
  export interface Colors {
    tertiary: string;
  }
  export interface ListItemProps {
    first?: boolean;
    last?: boolean;
  }
}