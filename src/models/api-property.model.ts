import { ApiProperty } from '@nestjs/swagger';

export class EncryptData {
    @ApiProperty()
    payload: string;
}

export class DecryptData {
    @ApiProperty()
    data1: string;

    @ApiProperty()
    data2: string;
}

export class ApiResponse {
    @ApiProperty()
    successful: boolean;

    @ApiProperty()
    error_code: string;
}

export class DataResponse<T> extends ApiResponse {
    @ApiProperty()
    data: T | null;
}
