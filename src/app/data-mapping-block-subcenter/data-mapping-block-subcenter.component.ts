import { Component, OnInit } from '@angular/core';
import { ConfirmationDialogsService } from 'app/services/dialog/confirmation.service';
import { BlockSubcenterMappingService } from 'app/services/ProviderAdminServices/block-subcenter-mapping-service';
import * as XLSX from 'xlsx';
import { dataService } from '../services/dataService/data.service';

@Component({
  selector: 'app-data-mapping-block-subcenter',
  templateUrl: './data-mapping-block-subcenter.component.html',
  styleUrls: ['./data-mapping-block-subcenter.component.css']
})
export class DataMappingBlockSubcenterComponent implements OnInit {
  file: any;
  fileList: FileList;
  error1: boolean = false;
  error2: boolean = false;
  invalid_file_flag: boolean = false;
  inValidFileName: boolean = false;
  maxFileSize: number = 5.0;
  jsonData: any;
  enableUPloadButton: boolean = false;
  valid_file_extensions = ['xls', 'xlsx', 'xlsm', 'xlsb'];
  fileContent: any;
  userID: any;
  showProgressBar: Boolean = false;
  disableUpload: Boolean = true;

  constructor(
    public dataService: dataService,
    public blockSubcenterMappingService: BlockSubcenterMappingService,
    public alertService: ConfirmationDialogsService,
  ) { }

  ngOnInit() {
    this.userID = this.dataService.uid;
  }

  onFileUpload(ev) {
    this.file = undefined;
    this.fileContent = null;
 
    this.fileList = ev.target.files;
    this.file = ev.target.files[0];

    //this.file = undefined;
    if (this.fileList.length == 0) {
    this.error1 = true;
    this.error2 = false;
    this.invalid_file_flag = false;
    this.inValidFileName = false;
    this.disableUpload = false;
    }
    else {
    if (this.file) {

        let fileNameExtension = this.file.name.split(".");
        let fileName = fileNameExtension[0];
        if(fileName !== undefined && fileName !== null && fileName !== "")
        {
        var isvalid = this.checkExtension(this.file);
        console.log(isvalid, 'VALID OR NOT');
        if (isvalid) {
    
            if ((this.fileList[0].size / 1000 / 1000) > this.maxFileSize) {
            console.log("File Size" + this.fileList[0].size / 1000 / 1000);
            this.error2 = true;
            this.error1 = false;
            this.invalid_file_flag = false;
            this.inValidFileName = false;
            this.disableUpload = false;
            }
            else {
            this.error1 = false;
            this.error2 = false;
            this.invalid_file_flag = false;
            this.inValidFileName = false;
            this.disableUpload = false;

            let workBook = null;
            this.jsonData = null;
            const reader = new FileReader();
            
            reader.onload = (event) => {
              const data = reader.result;
              workBook = XLSX.read(data, { type: 'binary' });
              this.jsonData = workBook.SheetNames.reduce((initial, name) => {
                const sheet = workBook.Sheets[name];
                initial[name] = XLSX.utils.sheet_to_json(sheet);
                return initial;
              }, {});
             // this.dataString = JSON.stringify(jsonData.Sheet1);
             
            }
            this.enableUPloadButton=false;
            reader.readAsBinaryString(this.file);
            
            const myReader: FileReader = new FileReader();
            myReader.onloadend = this.onLoadFileCallback.bind(this)
            myReader.readAsDataURL(this.file);
            this.invalid_file_flag = false;
            this.disableUpload = false;
            }
        }
        else {
            this.invalid_file_flag = true;
            this.inValidFileName = false;
            this.error1 = false;
            this.error2 = false;
            this.disableUpload = false;
        }
        }
        else{
        //this.alertService.alert("Invalid file name", 'error');
        this.inValidFileName = true;
        this.invalid_file_flag = false;
        this.error2 = false;
        this.error1 = false;
        this.disableUpload = false;
        }
        } else {
        
        this.invalid_file_flag = false;
        this.disableUpload = false;
        }
  }
}

  checkExtension(file) {
    let count = 0;
    console.log('FILE DETAILS', file);
    if (file) {
      let array_after_split = file.name.split('.');
      if(array_after_split.length == 2) {
      let file_extension = array_after_split[array_after_split.length - 1];
      for (let i = 0; i < this.valid_file_extensions.length; i++) {
        if (file_extension.toUpperCase() === this.valid_file_extensions[i].toUpperCase()) {
          count = count + 1;
        }
      }
      if (count > 0) {
        return true;
      }
      else {
        return false;
      }
    } else
    {
      return false;
    }
    }
    else {
      return true;
    }
  }
  onLoadFileCallback = (event) => {
    this.fileContent = event.currentTarget.result;
  }

  uploadFile(){
    console.log("file", this.file);
    console.log("fileContent",this.fileContent);
    let fileExtenstion = this.file.name.split('.');
    let reqObj = {
      "fileName": this.file.name,
      "fileExtension": fileExtenstion[fileExtenstion.length - 1],
      "fileContent": this.fileContent,
      "providerServiceMapID": this.dataService.providerServiceMapID_104,
      "createdBy": this.dataService.uname
    }
    this.showProgressBar = true;
    this.blockSubcenterMappingService.uploadData(reqObj).subscribe(
    (response) => {
      if(response && response.statusCode == 200){
        this.showProgressBar = false;
        this.alertService.alert('File Uploaded successfully', 'success');     
        this.disableUpload = true;
      } else {
        this.showProgressBar = false;
        this.alertService.alert(response.errorMessage, 'error');
        this.disableUpload = false;
      }
    });(err) => {
      this.showProgressBar = false;
      this.alertService.alert(err, 'error');
      this.disableUpload = false;
    }

  }


}
