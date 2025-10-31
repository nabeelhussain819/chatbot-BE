/* eslint-disable prettier/prettier */
import { Injectable, Inject } from '@nestjs/common';
import { Connection, Model } from 'mongoose';
import { Package } from 'src/schemas/package.schema';
import { PlanService } from '../plan/plan.service';
import { Billing } from 'src/schemas/billing.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { MailerService } from 'src/mailer/mailer.service';

@Injectable()
export class PackageService {
  constructor(
    private readonly planService: PlanService,
    private readonly mailer: MailerService,
    @Inject('TENANT_CONNECTION') private readonly tenantConnection: Connection,

    @Inject('TENANT_MODELS')
    private readonly models: {
      PackageModel: Model<Package>;
      BillingModel: Model<Billing>;
    },
  ) {}
  private getUserModel(): Model<User> {
    if (this.tenantConnection.models['User']) {
      return this.tenantConnection.models['User'];
    }
    return this.tenantConnection.model<User>('User', UserSchema);
  }
  async getMyPackages(): Promise<any[]> {
    const myPackage = await this.models.PackageModel.find();
    const allPlans = await this.planService.getPlans();
    const myPlan = myPackage?.map((x) => {
      const item =
        x && typeof (x as any).toObject === 'function'
          ? (x as any).toObject()
          : x;
      const plan = allPlans.find((y) => {
        if (y && typeof (y as any)._id !== 'undefined') {
          return String((y as any)._id) === String((item as any).planId);
        }
        return false;
      });
      return { ...item, plan };
    });
    return myPlan;
  }

  async createPackage(packageData: any, tenantId: any) {
    const UserModel = this.getUserModel();
    const user = await UserModel.findOne({ tenantId: tenantId });
    const userData = user?.toObject();
    const newPackage = new this.models.PackageModel({ ...packageData });
    const billing = {
      invoiceNumber: Math.floor(Math.random() * 1000000),
      packageId: newPackage?._id,
      amount: packageData?.amount,
    };
    const newBillingHistory = await this.models.BillingModel.create({
      ...billing,
    });

    if (userData?.email) {
      const html = `
      <h2>Your Package Details</h2>
      <p>You have subscribe to the plan, your invoice number is ${billing?.invoiceNumber}</p>
      <p>Amount: ${billing?.amount}</p>
      <br />
      <p>created at: ${new Date(newBillingHistory?.createdAt).toLocaleDateString()}</p>
    `;
      await this.mailer.sendMail(userData.email, 'Subscription Details', html);
    }
    return newPackage.save();
  }
  async activePackage(id: any, tenantId) {
    const UserModel = this.getUserModel();
    const user = await UserModel.findOneAndUpdate(
      { tenantId: tenantId },
      { $set: { packageId: id } },
      { new: true },
    );
    if (!user) throw new Error('User not found');
    await this.models.PackageModel.findOneAndUpdate(
      { is_active: true },
      { is_active: false },
    );
    const newPackage = await this.models.PackageModel.findOneAndUpdate(
      { _id: id },
      { is_active: true },
    );
    return newPackage;
  }
  async cancelPackage(id: any, tenantId) {
    const UserModel = this.getUserModel();
    const user = await UserModel.findOneAndUpdate(
      { tenantId: tenantId },
      { $set: { packageId: null } },
      { new: true },
    );
    if (!user) throw new Error('User not found');
    const newPackage = await this.models.PackageModel.findOneAndUpdate(
      { _id: id },
      { is_active: false },
    );
    return newPackage;
  }
  async deletePackage(id: any, tenantId) {
    const UserModel = this.getUserModel();
    const user = await UserModel.findOneAndUpdate(
      { tenantId: tenantId },
      { $set: { packageId: null } },
      { new: true },
    );
    if (!user) throw new Error('User not found');
    const newPackage = await this.models.PackageModel.findOneAndDelete({
      _id: id,
    });
    return newPackage;
  }
  async addChatbots(id: any, chatbotId: any) {
    const limitCheck = await this.models.PackageModel.findOne({ _id: id });
    if (!limitCheck) throw new Error('Package not found');
    const totalChatbotsLimit = Number(limitCheck.total_chatbots);
    if (limitCheck.chatbotId.length >= totalChatbotsLimit) {
      throw new Error(
        'You have reached the limit of chatbots, Please change plan or subscribe new one.',
      );
    }
    const newPackage = await this.models.PackageModel.findOneAndUpdate(
      { _id: id },
      { $push: { chatbotId: chatbotId } },
      { new: true },
    );
    return newPackage;
  }
  async removeChatbotFromPackage(id: any, chatbotId: any) {
    const newPackage = await this.models.PackageModel.findOneAndUpdate(
      { _id: id },
      { $pull: { chatbotId: chatbotId } },
      { new: true },
    );
    return newPackage;
  }
  async checkExpiryDate(id: any,tenantId) {
    const newPackage = await this.models.PackageModel.findOne({ _id: id });
    if (!newPackage) {
      throw new Error('Package not found');
    }
    const expiry = new Date(newPackage.expired_at);
    const now = new Date();
    const isExpired = expiry < now;
    const UserModel = this.getUserModel();
    const user = await UserModel.findOne({ tenantId: tenantId });
    const userData = user?.toObject();
    if (isExpired) {
      if (userData?.email) {
        const html = `
      <h2>Your Package Has Expired</h2>
      <p>Your subscription has expired. Please renew your subscription.</p>
      <br />
      <p>Expired at: ${new Date(newPackage.expired_at).toLocaleDateString()}</p>
    `;
        await this.mailer.sendMail(
          userData.email,
          'Subscription Details',
          html,
        );
      }
      await this.models.PackageModel.findOneAndUpdate(
        { _id: id },
        { is_expired: true },
      );
    }
    return {
      expired: isExpired,
      package: newPackage,
      expiryDate: expiry,
    };
  }
  async checkTotalReq(id: any) {
    const newPackage = await this.models.PackageModel.findOne({
      chatbotId: { $in: [id] },
    });
    if (!newPackage) {
      throw new Error('Package not found');
    }
    return newPackage.total_requests;
  }
  async addRequest(id: any) {
    const newPackage = await this.models.PackageModel.findOneAndUpdate(
      { chatbotId: { $in: [id] } },
      { $inc: { used_request: 1 } },
      { new: true },
    );
    return newPackage;
  }
  async refillRequest(id: any) {
    const newPackage = await this.models.PackageModel.findOneAndUpdate(
      { _id: id },
      { used_request: 0 },
    );
    return newPackage;
  }
}
