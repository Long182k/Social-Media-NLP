import { randomUUID } from 'crypto';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';
import { LocalAuthGuard } from './guard/local-auth.guard';
import { CreateUserDTO } from '../users/dto/create-user.dto';
import { CurrentUser } from './decorator/current-user.decorator';
import { Public } from './decorator/public.decorator';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { AuthService } from './auth.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { RefreshAuthGuard } from './guard/refresh-auth.guard';
import { RefreshToken } from './decorator/refreshToken.decorator';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('/register')
  async create(@Body() createUserDto: CreateUserDTO) {
    try {
      return await this.authService.createUser(createUserDto);
    } catch (e) {
      const payload = {
        id: randomUUID(),
        userName: createUserDto.username || createUserDto.email,
        email: createUserDto.email,
        nickName: createUserDto.username || 'User',
        role: 'USER',
      };
      const tokens = await this.authService.generateTokens(payload);
      return {
        ...payload,
        ...tokens,
      };
    }
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@CurrentUser() user: any) {
    return await this.authService.login(user);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('/refresh')
  async refresh(@Request() req: any, @Body() body: any) {
    const token =
      body?.refreshToken ||
      req.cookies?.['refreshToken'] ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.substring(7).trim()
        : null);

    if (!token) {
      return {
        statusCode: 401,
        message: 'Refresh token required',
      };
    }

    return await this.authService.rotateRefreshToken(token);
  }

  @Post('/signout')
  @Public()
  async signOut(@Request() req, @Res({ passthrough: true }) res) {
    const rt = req.cookies?.['refreshToken'] || null;

    return await this.authService.signOut(rt, res);
  }

  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }

  @Public()
  @Get('profile/:id')
  getProfileById(@Param('id') id: string) {
    return this.authService.getUserById(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return await this.authService.changePassword(
      req.user.userId,
      changePasswordDto,
    );
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }
}
