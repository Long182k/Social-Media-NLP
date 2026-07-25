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
  create(@Body() createUserDto: CreateUserDTO) {
    return this.authService.createUser(createUserDto);
  }

  @HttpCode(HttpStatus.OK)
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async login(@Res({ passthrough: true }) res, @CurrentUser() user: any) {
    const loginInfo = await this.authService.login(user);

    // set HttpOnly cookie for refresh token
    res.cookie('refreshToken', loginInfo.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    delete loginInfo.refreshToken;

    return loginInfo;
  }

  @HttpCode(HttpStatus.OK)
  @RefreshToken()
  @UseGuards(RefreshAuthGuard)
  @Post('/refresh')
  async refresh(@Res({ passthrough: true }) res, @CurrentUser() user) {
    // user = req.user = the returned value of Refresh-strategy's validate
    const { accessToken, refreshToken } = user.newTokens;

    // set new refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { accessToken };
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
