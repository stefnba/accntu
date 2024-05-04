export type TDateFilterFilteredValue =
    | {
          period: string;
      }
    | {
          period: 'CUSTOM';
          startDate?: string;
          endDate?: string;
      };
