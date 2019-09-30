import { States } from './states';

type TProcessDTO<T> = {
  id: string;
  userId: string;
  process: string;
  step: number;
  state: States;
  vars: T;
};

type TStatus = {
  process: string;
  step: number;
  state: States;
};

export {
  TProcessDTO,
  TStatus
};
