import {
    createParamDecorator,
    ExecutionContext,
    NotFoundException,
  } from '@nestjs/common';
  
  export const GetID = createParamDecorator(
    (data: string, ctx: ExecutionContext) => {
      const request = ctx.switchToHttp().getRequest();
      const id = request.params[data];
  
      if (!/^\d+$/.test(id)) {
        
        throw new NotFoundException('SYS-0003');
      }
  
      return parseInt(id);
    },
  );
  