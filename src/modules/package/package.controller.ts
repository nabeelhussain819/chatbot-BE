/* eslint-disable prettier/prettier */
import { Body, Controller, Get, Param, Post, Req } from '@nestjs/common';
import { PackageService } from './package.service';

@Controller('package')
export class PackageController {
  constructor(private packageService: PackageService) {}

  @Get('/my-packages')
  async getMyPackages() {
    return this.packageService.getMyPackages();
  }

  @Post('/create-packages')
  async createPackage(@Body() body: any, @Req() req) {
    const tenantId = req.headers['x-tenant-id'];
    return this.packageService.createPackage(body, tenantId);
  }

  @Post('/active-packages')
  async activePackage(@Req() req, @Body() body: any) {
    const tenantId = req.headers['x-tenant-id'];
    return this.packageService.activePackage(body.id, tenantId);
  }

  @Post('/cancel-packages')
  async cancelPackage(@Req() req, @Body() body: any) {
    const tenantId = req.headers['x-tenant-id'];
    return this.packageService.cancelPackage(body.id, tenantId);
  }
  @Post('/delete-packages')
  async deletePackage(@Req() req, @Body() body: any) {
    const tenantId = req.headers['x-tenant-id'];
    return this.packageService.deletePackage(body.id, tenantId);
  }
  @Get('check-expiry/:id')
  async checkExpiryDate(@Req() req,@Param() body: any) {
    const tenantId = req.headers['x-tenant-id'];
    return this.packageService.checkExpiryDate(body.id,tenantId);
  }
  @Post("/refill-requests")
  async refillRequest(@Req() req, @Body() body: any) {
    return this.packageService.refillRequest(body.id);
  }
}
