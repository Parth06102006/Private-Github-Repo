class ApiError extends Error{
    constructor(statusCode,message="Something Went Wrong Try Again Later",error='',stack)
    {
        super(message);
        this.statusCode = statusCode;
        this.success = (statusCode>300) ? false : true ;
        this.message = message;
        this.data = {};
        this.error = error;
        if(this.stack)
        {
            this.stack = stack;
        }
        else
        {
            Error.captureStackTrace(this,this.constructor)
        }
    }
}

export default ApiError;