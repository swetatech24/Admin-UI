import { Component, OnInit } from '@angular/core';
import { ProviderAdminRoleService } from "../services/ProviderAdminServices/state-serviceline-role.service";
import { dataService } from '../services/dataService/data.service';
import { ZoneMasterService } from '../services/ProviderAdminServices/zone-master-services.service';
import { ConfirmationDialogsService } from './../services/dialog/confirmation.service';

@Component({
  selector: 'app-zone-district-mapping',
  templateUrl: './zone-district-mapping.component.html'
})
export class ZoneDistrictMappingComponent implements OnInit {

  showMappings:any = true;
  availableZoneDistrictMappings:any =[];
  data:any;
  providerServiceMapID:any;
  provider_states:any;
  provider_services:any;
  service_provider_id:any;
  editable:any = false;
  availableZones:any = [];
  districts:any = [];

  constructor(public providerAdminRoleService: ProviderAdminRoleService,
              public commonDataService: dataService,
              public zoneMasterService:ZoneMasterService,
              private alertMessage: ConfirmationDialogsService) { 
    this.data = [];
    this.service_provider_id =this.commonDataService.service_providerID;
   }

  showForm(){
        this.showMappings = false;
    }
    ngOnInit() {
        this.getAvailableZoneDistrictMappings();
        //this.getStates();
        this.getServiceLines();
        this.getAvailableZones();
    }

    stateSelection(stateID) {
        this.getServices(stateID);
    }

    getServices(stateID) {
        this.providerAdminRoleService.getServices(this.service_provider_id, stateID).subscribe(response => this.getServicesSuccessHandeler(response));
    }

    getStates() {
        this.providerAdminRoleService.getStates(this.service_provider_id).subscribe(response => this.getStatesSuccessHandeler(response));
    }

    getServiceLines(){
        this.zoneMasterService.getServiceLines().subscribe(response => this.getServicesSuccessHandeler(response));
    }

    getStatesByServiceID(serviceID){
        this.zoneMasterService.getStatesByServiceID(serviceID,this.service_provider_id).subscribe(response => this.getStatesSuccessHandeler(response));
    }

    getStatesSuccessHandeler(response) {
        this.provider_states = response;
    }

    getServicesSuccessHandeler(response) {
        this.provider_services = response;
        for (let provider_service of this.provider_services) {
            if ("MMU" == provider_service.serviceName) {
                this.providerServiceMapID = provider_service.providerServiceMapID;
            }
        }
    }

    getAvailableZoneDistrictMappings() {
        this.zoneMasterService.getZoneDistrictMappings().subscribe(response => this.getZoneDistrictMappingsSuccessHandler(response));
    }

    getZoneDistrictMappingsSuccessHandler(response) {
        this.availableZoneDistrictMappings = response;
        console.log(this.availableZoneDistrictMappings)
    }

    getAvailableZones() {
        this.zoneMasterService.getZones().subscribe(response => this.getZonesSuccessHandler(response));
    }

    getZonesSuccessHandler(response) {
        if(response!=undefined){
            for(let zone of response){
                if(!zone.deleted){
                    this.availableZones.push(zone);
                }
            }
        }
    }

    getDistricts(stateID)
	{
		this.zoneMasterService.getDistricts(stateID).subscribe((response:Response)=>this.getDistrictsSuccessHandeler(response));
	}
    getDistrictsSuccessHandeler(response)
	{
		console.log(response, "districts retrieved");
		this.districts = response;
	}

    zoneDistrictMappingObj:any ;
    zoneDistrictMappingList:any= [];
    mappedDistrictIDs:any = [];
    addZoneDistrictMappingToList(values){
        let districtIds = [];
        for(let districts of values.districtIdList){
            districtIds.push(districts.split("-")[0]);
        }

         //find district deselected from the list , and Remove zone mapping with that district
        for(let mappedDistrict of this.mappedDistricts){
            this.mappedDistrictIDs.push(mappedDistrict.districtID); // fetching mapped districtID's
            
            this.dataObj = {};
            this.dataObj.zoneDistrictMapID = mappedDistrict.zoneDistrictMapID;
            this.dataObj.modifiedBy = "Admin";
            if(districtIds.indexOf(mappedDistrict.districtID.toString())==-1){
                this.dataObj.deleted =  true;
                this.zoneMasterService.updateZoneMappingStatus(this.dataObj).subscribe(response => this.updateStatusHandler(response));
            }else if(mappedDistrict.deleted){
                this.dataObj.deleted =  false;
                this.zoneMasterService.updateZoneMappingStatus(this.dataObj).subscribe(response => this.updateStatusHandler(response));
            }
        }

         for(let districts of values.districtIdList){
             let districtId = districts.split("-")[0];
             //make a map of zone with District, If the districtId not in the mappedDistrictIDs( already mapped districtID's)
            if(this.mappedDistrictIDs.indexOf(parseInt(districtId))==-1){
                this.zoneDistrictMappingObj = {};
                this.zoneDistrictMappingObj.zoneID = values.zoneID.split("-")[0];
                this.zoneDistrictMappingObj.zoneName = values.zoneID.split("-")[1];
                this.zoneDistrictMappingObj.districtID = districtId;
                this.zoneDistrictMappingObj.districtName = districts.split("-")[1];
                // for(let provider_service of this.provider_services){
                //     if("MMU"==provider_service.serviceName){
                //         this.zoneDistrictMappingObj.providerServiceMapID =  provider_service.providerServiceMapID;
                //         this.zoneDistrictMappingObj.stateName = provider_service.stateName;
                //     }
                // } 
                this.zoneDistrictMappingObj.providerServiceMapID = values.stateID.split("-")[1];
                this.zoneDistrictMappingObj.stateName = values.stateID.split("-")[2];
                this.zoneDistrictMappingObj.createdBy = "System";

                this.zoneDistrictMappingList.push(this.zoneDistrictMappingObj);
                console.log(this.zoneDistrictMappingList);
            }else{
                console.log("already mapped with this district's");
            }
         }
         if(this.zoneDistrictMappingList.length<=0){
            this.alertMessage.alert("Zones Mapped Successfully");
         }
    }

    storezoneMappings(){
        console.log(this.zoneDistrictMappingList);
        let obj = {"zoneDistrictMappings":this.zoneDistrictMappingList};
        this.zoneMasterService.saveZoneDistrictMappings(JSON.stringify(obj)).subscribe(response => this.successHandler(response));
    }

    successHandler(response){
        this.zoneDistrictMappingList =  [];
        this.alertMessage.alert("zones saved");
        this.getAvailableZoneDistrictMappings();
    }

    dataObj: any = {};
    updateZoneMappingStatus(zoneMapping) {

        this.dataObj = {};
        this.dataObj.zoneDistrictMapID = zoneMapping.zoneDistrictMapID;
        this.dataObj.deleted = !zoneMapping.deleted;
        this.dataObj.modifiedBy = "Admin";
        this.zoneMasterService.updateZoneMappingStatus(this.dataObj).subscribe(response => this.updateStatusHandler(response));

        zoneMapping.deleted = !zoneMapping.deleted;

    }
    updateStatusHandler(response) {
        console.log("zoneMapping Status Changed");
    }

    mappedDistricts:any = [];
    districtIdList:any = [];
    existingDistricts:any = [];
    checkExistance(stateID,zoneID){
        this.mappedDistricts = [];
        this.districtIdList = [];
        this.existingDistricts = [];
        //this.mappedDistricts = this.districts;
        let providerServiceMapID = "";
        if(stateID!=undefined){
            providerServiceMapID = stateID.split("-")[1];
        }
        if(zoneID!=undefined){
            zoneID = zoneID.split("-")[0];
        }
        
        for(let zoneDistrictMappings of this.availableZoneDistrictMappings){
            if(zoneDistrictMappings.providerServiceMapID == providerServiceMapID && zoneDistrictMappings.zoneID == zoneID){
                if(this.mappedDistricts.indexOf(zoneDistrictMappings.districtID)==-1){
                    // finding exsting zone mappings with districts
                    this.mappedDistricts.push(zoneDistrictMappings);
                   // this.mappedDistricts.push(zoneDistrictMappings.districtID);
                   if(!zoneDistrictMappings.deleted){
                        this.existingDistricts.push(zoneDistrictMappings.districtID+"-"+zoneDistrictMappings.districtName);
                   }
                }
                    
            }
        }
        
        console.log(this.mappedDistricts);
        this.districtIdList = this.existingDistricts;
        console.log(this.districtIdList);
       
    }

}