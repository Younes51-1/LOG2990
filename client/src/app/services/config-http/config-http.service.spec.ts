import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ConfigHttpService } from './config-http.service';

describe('ConfigHttpService', () => {
    let httpMock: HttpTestingController;
    let service: ConfigHttpService;
    // let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(ConfigHttpService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        // baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    // TODO
    it('should be created', () => {
        expect(service).toBeTruthy();
        // expect(baseUrl).toEqual('http://localhost:3000/api');
    });
});
