class ApiResponse{
    constructor(statusCode,message="Successfull",data={})
    {
        this.statusCode = statusCode;
        this.success = (statusCode<300) ? true : false ;
        this.message = message;
        this.data = data;
    }
}

export default ApiResponse;