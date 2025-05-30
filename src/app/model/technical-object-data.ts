import { Datapoint } from './datapoint';

export interface TechnicalObjectData {
  SSID: string;
  categoryName: string;
  positionID: string;
  technicalObjectNumber: string;
  technicalObjectType: string;
  values: Datapoint[];
}
