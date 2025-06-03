import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConversionService } from '../service/conversion.service';
import { TechnicalObjectData } from '../model/technical-object-data';

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
  private filetype: string | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private conversion = inject(ConversionService);

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
    this.filetype = this.filename.split('.')[1];

    const reader = new FileReader();
    reader.onload = () => {
      this.fileContents = reader.result as string;
    };
    reader.readAsText(file);
  }

  submitForm() {
    if (this.form.invalid) {
      this.errorMessage = 'Fill out the missing values';
      return;
    }
    if (!this.fileContents || this.filetype !== 'csv') {
      this.errorMessage = 'Select a csv file';
      return;
    }

    try {
      this.isLoading = true;
      this.cdr.detectChanges(); // forcing a manual change detection

      const valuesData = this.conversion.convertCsvToJson(this.fileContents);

      const jsonData: TechnicalObjectData = {
        ...this.form.value,
        values: valuesData,
      };

      const blob = this.conversion.downloadJSON(jsonData);

      //downloadable link
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `${this.filename}.json`;

      link.click();

      // Cleanup and hide loader after a short delay
      setTimeout(() => {
        URL.revokeObjectURL(link.href);
        this.isLoading = false;
        this.cdr.detectChanges(); // forcing a manual change detection
      }, 500);
    } catch (err) {
      this.errorMessage = 'An error occured while processing the file';
      console.error(err);
      this.isLoading = false;
    }
  }
}
