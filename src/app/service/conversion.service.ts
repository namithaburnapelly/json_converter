import { Injectable } from '@angular/core';
import { Datapoint } from '../model/datapoint';
import { TechnicalObjectData } from '../model/technical-object-data';

@Injectable({
  providedIn: 'root',
})
export class ConversionService {
  constructor() {}

  convertCsvToJson(fileContents: string): Datapoint[] {
    const lines = fileContents
      .split(/\r?\n/)
      .filter((line) => line.trim() !== '');

    const headers = lines[0].split(',').map((h) => h.trim());

    let data: Datapoint[] = [];

    lines.slice(1).map((line: any) => {
      const values = line.split(',');
      const obj: any = {};
      headers.forEach((header, _i) => {
        const val = values[_i].trim();
        obj[header] = this.convertIfValidTimestamp(val);
      });
      data.push(obj);
    });

    return data;
  }

  downloadJSON(jsonData: TechnicalObjectData): Blob {
    const data = JSON.stringify(jsonData, null, 2);
    return new Blob([data], { type: 'application/json' });
  }

  private convertIfValidTimestamp(value: string) {
    const timestamp = Number(value);
    if (this.isWithIn90Days(timestamp)) {
      const date = this.isMilliSeconds(timestamp)
        ? new Date(timestamp)
        : new Date(timestamp * 1000);
      return date.toISOString();
    }
    return value;
  }

  private isMilliSeconds(timestamp: number): boolean {
    return timestamp > 1e12;
  }

  private isWithIn90Days(timestamp: number): boolean {
    const date = this.isMilliSeconds(timestamp)
      ? new Date(timestamp)
      : new Date(timestamp * 1000);
    const now = new Date();

    const nientyDaysInMs = 90 * 24 * 60 * 60 * 1000;
    const lowerBound = new Date(now.getTime() - nientyDaysInMs);
    const upperBound = new Date(now.getTime() + nientyDaysInMs);

    return date >= lowerBound && date <= upperBound;
  }
}
