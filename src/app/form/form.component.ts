import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
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
export class FormComponent implements OnDestroy {
  form: FormGroup;
  private fileContents: string = '';
  private filename: string | null = null;
  private filetype: string | null = null;
  errorMessage: string = '';
  previewMode: boolean = false;
  isLoading: boolean = false;
  jsonData!: TechnicalObjectData;

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
    this.errorMessage = '';
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) {
      this.errorMessage = 'Select a csv file';
      this.fileContents = '';
      return;
    }

    this.filename = file.name;
    this.filetype = this.filename.split('.')[1];
    this.filename = this.filename.split('.')[0];

    if (this.filetype !== 'csv') {
      this.errorMessage = 'Select a csv file';
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.fileContents = reader.result as string;
    };
    reader.readAsText(file);
  }

  previewForm() {
    if (this.form.invalid) {
      this.errorMessage = 'Fill out the missing values';
      return;
    }
    if (!this.fileContents || this.filetype !== 'csv') {
      this.errorMessage = 'Select a csv file';
      return;
    }

    try {
      const valuesData = this.conversion.convertCsvToJson(this.fileContents);

      this.jsonData = {
        ...this.form.value,
        values: valuesData,
      };
      this.previewMode = true;
    } catch (err) {
      this.errorMessage = 'An error occured while processing the file';
      console.error(err);
    }
  }

  DownloadForm() {
    this.isLoading = true;
    // this.cdr.detectChanges(); // forcing a manual change detection
    try {
      const blob = this.conversion.downloadJSON(this.jsonData);

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
      this.errorMessage = 'Unexpected Error occured. Try again.';
      console.error(err);
      this.isLoading = false;
    }
  }

  CancelForm() {
    this.previewMode = false;
  }

  ngOnDestroy(): void {
    this.previewMode = false;
  }
}
