import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-form',
  standalone: false,
  templateUrl: './form.component.html',
  styleUrl: './form.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormComponent {
  form: FormGroup;
  private fileContents: string = '';
  private filename: string | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  private fb = inject(FormBuilder);
  constructor() {
    this.form = this.fb.group({
      SSID: ['IAMCLNT100', Validators.required],
      technicalObjectType: ['EQUI', Validators.required],
      technicalObjectNumber: ['', Validators.required],
      categoryName: ['M', Validators.required],
      positionID: ['', Validators.required],
    });
  }

  fileChange(event: Event) {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;

    this.filename = file.name;
    this.filename = this.filename.split('.')[0];

    const reader = new FileReader();
    reader.onload = () => {
      this.fileContents = reader.result as string;
    };
    reader.readAsText(file);
  }

  async submitForm() {
    this.isLoading = true;

    if (!this.fileContents) {
      this.isLoading = false;
      this.errorMessage = 'Select a csv file';
      return;
    }

    try {
      const lines = this.fileContents
        .split(/\r?\n/)
        .filter((line) => line.trim() !== '');

      const headers = lines[0].split(',').map((h) => h.trim());

      let data: any[] = [];

      lines.slice(1).map((line: any) => {
        const values = line.split(',');
        const obj: any = {};
        headers.forEach((header, _i) => {
          const val = values[_i].trim();
          obj[header] = this.convertIfValidTimestamp(val);
        });
        data.push(obj);
      });

      const finaljsonData = {
        ...this.form.value,
        values: data,
      };

      // console.log(finaljsonData);
      const jsonData = JSON.stringify(finaljsonData, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });

      //downloadable link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${this.filename}.json`;

      // Small delay to ensure UI updates (Angular change detection)
      await new Promise((resolve) => setTimeout(resolve, 100));

      link.click();

      // Cleanup and hide loader after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
        this.isLoading = false;
      }, 1000);
    } catch (err) {
      this.errorMessage = 'An error occured while processing the file';
      console.error(err);
      this.isLoading = false;
    }
  }

  isMilliSeconds(timestamp: number): boolean {
    return timestamp > 1e12;
  }

  isWithIn90Days(timestamp: number): boolean {
    const date = this.isMilliSeconds(timestamp)
      ? new Date(timestamp)
      : new Date(timestamp * 1000);
    const now = new Date();

    const nientyDaysInMs = 90 * 24 * 60 * 60 * 1000;
    const lowerBound = new Date(now.getTime() - nientyDaysInMs);
    const upperBound = new Date(now.getTime() + nientyDaysInMs);

    return date >= lowerBound && date <= upperBound;
  }

  convertIfValidTimestamp(value: string) {
    const timestamp = Number(value);
    if (this.isWithIn90Days(timestamp)) {
      const date = this.isMilliSeconds(timestamp)
        ? new Date(timestamp)
        : new Date(timestamp * 1000);
      return date.toISOString();
    }
    return value;
  }
}
