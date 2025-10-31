/* eslint-disable prettier/prettier */
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';
import { Tenant } from 'src/schemas/tenant.schema';
import { TenantConnectionService } from 'src/tenants/tenant-connection.service';
import { User, UserSchema } from 'src/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private readonly configService: ConfigService,
    private readonly tenantConnectionService: TenantConnectionService,

    @InjectModel(Tenant.name)
    private tenantModel: Model<Tenant>,

    @Inject('TENANT_MODELS')
    private readonly models: { UserModel: Model<User> },
  ) {}

  private getTenantUserModel(connection): Model<User> {
    return connection.models['User'] || connection.model('User', UserSchema);
  }

  async register(email: string, password: string, user_name: string) {
    if (!email || !password)
      throw new BadRequestException('Email and password are required');

    // Step 1: Check if tenant already exists
    let tenant = await this.tenantModel.findOne({ email });
    if (tenant) throw new ConflictException('User already exists');

    // Step 2: Create tenant entry in main DB
    tenant = await this.tenantModel.create({
      name: user_name,
      email,
      tenantId: `${user_name.replace(/\s+/g, '_')}_${Date.now()}`,
      dbUri: `mongodb://localhost:27017/${user_name.replace(/\s+/g, '_')}_${Date.now()}`,
    });

    // Step 3: Create connection to this tenant's DB
    const connection = await this.tenantConnectionService.getConnection(
      tenant.tenantId,
      tenant.dbUri,
    );

    // Step 4: Get tenant-specific User model safely
    const UserModel = this.getTenantUserModel(connection);

    const hashed = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
      email,
      password: hashed,
      user_name,
      tenantId: tenant.tenantId,
      email_notification: true,
      push_notification: false,
      update_notification: false,
      marketing_notification: false,
    });

    // Step 5: Generate JWT
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret)
      throw new BadRequestException('Missing JWT_SECRET in environment');

    const token = jwt.sign({ tenantId: tenant.tenantId, email }, secret, {
      expiresIn: '1h',
    });

    const safeUser = user.toObject();
    return { ...safeUser, token };
  }

  async login(email: string, password: string): Promise<any> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret)
      throw new BadRequestException('Missing JWT_SECRET in environment');
    const tenant = await this.tenantModel.findOne({ email });
    if (!tenant) throw new NotFoundException('No tenant found for this user');
    const connection = await this.tenantConnectionService.getConnection(
      tenant.tenantId,
      tenant.dbUri,
    );
    const UserModel = this.getTenantUserModel(connection);
    const user = await UserModel.findOne({ email }).exec();
    if (!user) throw new NotFoundException('User not found');
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new BadRequestException('Invalid password');
    const token = jwt.sign({ tenantId: tenant.tenantId, email }, secret, {
      expiresIn: '1h',
    });
    try {
      const userWithPackage = await user.populate('packageId');
      const safeUser = userWithPackage.toObject();
      return { ...safeUser, token };
    } catch (err) {
      return { ...user.toObject(), token };
    }
  }

  async findOrCreateGoogleUser(googleUser: any) {
    const { email, name } = googleUser;

    let tenant = await this.tenantModel.findOne({ email });
    if (!tenant) {
      tenant = await this.tenantModel.create({
        name,
        email,
        tenantId: `${name.replace(/\s+/g, '_')}_${Date.now()}`,
        dbUri: `mongodb://localhost:27017/${name.replace(/\s+/g, '_')}_${Date.now()}`,
      });
    }

    const connection = await this.tenantConnectionService.getConnection(
      tenant.tenantId,
      tenant.dbUri,
    );

    const UserModel = this.getTenantUserModel(connection);

    let user = await UserModel.findOne({ email }).exec();
    if (!user) {
      const randomPassword = await bcrypt.hash(
        Math.random().toString(36).slice(-8),
        10,
      );
      user = await UserModel.create({
        email,
        user_name: name,
        password: randomPassword,
        tenantId: tenant.tenantId,
        is_2FA: true,
        googleAuth: true,
      });
    }
    try {
      const userWithPackage = await user.populate('packageId');
      const safeUser = userWithPackage.toObject();
      return safeUser;
    } catch (err) {
      return user;
    }
  }

  async generateJwt(user: any) {
    const secret = this.configService.get<string>('JWT_SECRET');
    return jwt.sign(
      { tenantId: user.tenantId, email: user.email },
      secret ?? 'default_secret',
      { expiresIn: '1d' },
    );
  }

  async forgetPassword(body: { email: string; password: string; otp: string }) {
    const { email, password } = body;

    const tenant = await this.tenantModel.findOne({ email });
    if (!tenant) throw new NotFoundException('No tenant found for this user');

    const connection = await this.tenantConnectionService.getConnection(
      tenant.tenantId,
      tenant.dbUri,
    );

    const UserModel = this.getTenantUserModel(connection);

    const user = await UserModel.findOne({ email });
    if (!user) throw new NotFoundException('User not found');
    if (user.googleAuth)
      throw new BadRequestException('Google user cannot change password');

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Password updated successfully' };
  }

  async getUserData(tenantId: any) {
    const tenant = await this.tenantModel.findOne({ tenantId });
    if (!tenant) throw new NotFoundException('No tenant found for this user');
    const connection = await this.tenantConnectionService.getConnection(
      tenant.tenantId,
      tenant.dbUri,
    );
    const UserModel = this.getTenantUserModel(connection);
    const user_data = await UserModel.findOne({ tenantId })
      .populate('packageId')
      .exec();
    return user_data;
  }
}
