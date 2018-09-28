import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';

import { ConfigService } from '../config/config.service';
import { InterceptedHttp } from '../../http.interceptor';
import { SecurityInterceptedHttp } from '../../http.securityinterceptor';

@Injectable()
export class EmployeeParkingPlaceMappingService {

    getUsernamesURL: string;
    deleteEmployeesURL: string;
    providerAdmin_Base_Url: any;
    common_Base_Url: any;

    saveEmployeeParkingPlaceMappingURL: any;
    updateEmployeeParkingPlaceMappingURL: any;
    userNameURL: any;
    getEmployeeURL: any;
    _getStateListBYServiceIDURL: any;
    _getServiceLineURL: any;
    getParkingPlacesURL: any;
    getDesignationsURL: any;
    getEmployeesURL: any;
    _getZonesURL: any;

    constructor(private http: SecurityInterceptedHttp,
        public basepaths: ConfigService,
        public httpIntercept: InterceptedHttp) {
        this.providerAdmin_Base_Url = this.basepaths.getAdminBaseUrl();
        this.common_Base_Url = this.basepaths.getCommonBaseURL();

        this._getStateListBYServiceIDURL = this.providerAdmin_Base_Url + 'm/role/stateNew';
        this._getServiceLineURL = this.providerAdmin_Base_Url + 'm/role/serviceNew';
        this._getZonesURL = this.providerAdmin_Base_Url + "zonemaster/get/zones";
        this.getParkingPlacesURL = this.providerAdmin_Base_Url + 'parkingPlaceMaster/get/parkingPlacesbyzoneid';
        this.getDesignationsURL = this.providerAdmin_Base_Url + 'm/getDesignation';
        this.getEmployeesURL = this.providerAdmin_Base_Url + 'parkingPlaceMaster/get/userParkingPlaces1';
        this.deleteEmployeesURL = this.providerAdmin_Base_Url + 'parkingPlaceMaster/delete/userParkingPlaces1';
        this.getUsernamesURL = this.providerAdmin_Base_Url + '/parkingPlaceMaster/get/unmappeduser';
        this.saveEmployeeParkingPlaceMappingURL = this.providerAdmin_Base_Url + 'parkingPlaceMaster/save/userParkingPlaces';
        this.updateEmployeeParkingPlaceMappingURL = this.providerAdmin_Base_Url + '/parkingPlaceMaster/edit/userParkingPlaces1';
        this.userNameURL = "";
    }
    getServices(userID) {
        return this.httpIntercept.post(this._getServiceLineURL, { 'userID': userID })
            .map(this.handleState_n_ServiceSuccess)
            .catch(this.handleError);
    }

    getStates(userID, serviceID, isNationalFlag) {
        return this.http.post(this._getStateListBYServiceIDURL,
            {
                'userID': userID,
                'serviceID': serviceID,
                'isNational': isNationalFlag
            }).map(this.handleSuccess)
            .catch(this.handleError);
    }
    getZones(data) {
        return this.http.post(this._getZonesURL, data)
            .map(this.handleSuccess)
            .catch(this.handleError);
    }

    getParkingPlaces(data) {
        return this.http.post(this.getParkingPlacesURL, data)
            .map(this.handleState_n_parkingplaces)
            .catch(this.handleError);
    }

    DeleteEmpParkingMapping(requestObject) {
        return this.http.post(this.deleteEmployeesURL, requestObject)
            .map(this.handleSuccess)
            .catch(this.handleError);
    }
    getUsernames(userObj) {
        return this.http.post(this.getUsernamesURL, userObj)
            .map(this.handleState_n_Usernames)
            .catch(this.handleError);
    }


    getDesignations() {
        return this.http.post(this.getDesignationsURL, {})
            .map(this.handleSuccess)
            .catch(this.handleError);
    }

    getEmployees(requestObject) {
        return this.http.post(this.getEmployeesURL, requestObject)
            .map(this.handleSuccess)
            .catch(this.handleError);
    }

    saveEmployeeParkingPlaceMappings(data) {
        return this.http.post(this.saveEmployeeParkingPlaceMappingURL, data)
            .map(this.handleSuccess)
            .catch(this.handleError);
    }
    updateEmployeeParkingPlaceMappings(data) {
        return this.http.post(this.updateEmployeeParkingPlaceMappingURL, data)
            .map(this.handleSuccess)
            .catch(this.handleError);
    }
    getUserNames(designationID, sp) {
        return this.http.post(this.userNameURL, {
            'designationID': designationID,
            'serviceProviderID': sp
        })
            .map(this.handleState_n_Usernames)
            .catch(this.handleError);
    }



    handleState_n_parkingplaces(response: Response) {

        console.log(response.json().data, 'service point village file success response');
        let result = [];
        result = response.json().data.filter(function (item) {
            if (!item.deleted) {
                return item;
            }
        });
        return result;
    }
    handleSuccess(res: Response) {
        console.log(res.json().data, '--- in employee parking place master SERVICE');
        if (res.json().data) {
            return res.json().data;
        } else {
            return Observable.throw(res.json());
        }
    }
    handleState_n_ServiceSuccess(response: Response) {

        console.log(response.json().data, 'service point file success response');
        let result = [];
        result = response.json().data.filter(function (item) {
            if (item.serviceName == "MMU") {
                return item;
            }
        });
        return result;
    }
    handleState_n_Usernames(response: Response) {

        console.log(response.json().data, 'service point file success response');
        let result = [];
        result = response.json().data.filter(function (item) {
            if (!item.deleted) {
                return item;
            }
        });
        return result;
    }

    handleError(error: Response | any) {
        return Observable.throw(error.json());
    }

}
