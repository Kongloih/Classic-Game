import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Phone,
  Lock,
  Person,
  Email,
  Send,
} from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import axios from 'axios';

// 表单验证模式
const registerSchema = yup.object().shape({
  username: yup
    .string()
    .required('用户名不能为空')
    .min(3, '用户名至少3个字符')
    .max(20, '用户名最多20个字符')
    .matches(/^[a-zA-Z0-9_]+$/, '用户名只能包含字母、数字和下划线'),
  phone: yup
    .string()
    .required('手机号不能为空')
    .matches(/^1[3-9]\d{9}$/, '请输入正确的手机号'),
  email: yup
    .string()
    .email('请输入正确的邮箱地址')
    .required('邮箱不能为空'),
  password: yup
    .string()
    .required('密码不能为空')
    .min(6, '密码至少6个字符')
    .max(20, '密码最多20个字符')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, '密码必须包含大小写字母和数字'),
  confirmPassword: yup
    .string()
    .required('请确认密码')
    .oneOf([yup.ref('password')], '两次输入的密码不一致'),
  verificationCode: yup
    .string()
    .required('验证码不能为空')
    .length(6, '验证码为6位数字'),
  gender: yup
    .string()
    .required('请选择性别'),
  birthYear: yup
    .number()
    .required('请选择出生年份')
    .min(1900, '出生年份不能早于1900年')
    .max(new Date().getFullYear(), '出生年份不能晚于当前年份'),
});

const RegisterPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeStep, setActiveStep] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    setValue,
    trigger,
  } = useForm({
    resolver: yupResolver(registerSchema),
    mode: 'onChange',
  });

  const watchedPhone = watch('phone');

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const sendVerificationCode = async () => {
    const phone = watchedPhone;
    if (!phone) {
      setError('请先输入手机号');
      return;
    }

    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const response = await axios.post('/api/auth/send-sms', {
        phone: phone,
        type: 'register'
      });

      if (response.data.success) {
        setSuccess('验证码已发送到您的手机');
        setCountdown(60);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.data.message || '发送验证码失败');
      }
    } catch (error) {
      console.error('发送验证码错误:', error);
      setError(error.response?.data?.message || '发送验证码失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 注册提交
  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const response = await axios.post('/api/auth/register', {
        username: data.username,
        phone: data.phone,
        email: data.email,
        password: data.password,
        verificationCode: data.verificationCode,
        gender: data.gender,
        birthYear: data.birthYear,
      });

      if (response.data.success) {
        setSuccess('注册成功！正在跳转到登录页面...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(response.data.message || '注册失败');
      }
    } catch (error) {
      console.error('注册错误:', error);
      setError(error.response?.data?.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // 步骤处理
  const handleNext = async () => {
    const fieldsToValidate = activeStep === 0 
      ? ['username', 'phone', 'email', 'password', 'confirmPassword']
      : ['verificationCode', 'gender', 'birthYear'];
    
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      if (activeStep === 0) {
        setActiveStep(1);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    setActiveStep(activeStep - 1);
  };

  const steps = ['基本信息', '验证信息'];

  // 生成年份选项
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        py: 4,
      }}
    >
      <Container maxWidth="md">
        <Paper
          elevation={24}
          sx={{
            p: 4,
            borderRadius: 3,
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* 标题 */}
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom fontWeight={700}>
              用户注册
            </Typography>
            <Typography variant="body1" color="text.secondary">
              创建您的游戏账户，开始精彩游戏之旅
            </Typography>
          </Box>

          {/* 步骤指示器 */}
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* 错误和成功消息 */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {success}
            </Alert>
          )}

          {/* 表单 */}
          <form onSubmit={handleSubmit(onSubmit)}>
            {activeStep === 0 && (
              <Grid container spacing={3}>
                {/* 用户名 */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="username"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="用户名"
                        error={!!errors.username}
                        helperText={errors.username?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Person />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* 手机号 */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="phone"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="手机号"
                        error={!!errors.phone}
                        helperText={errors.phone?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Phone />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* 邮箱 */}
                <Grid item xs={12}>
                  <Controller
                    name="email"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="邮箱"
                        type="email"
                        error={!!errors.email}
                        helperText={errors.email?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Email />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* 密码 */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="password"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="密码"
                        type={showPassword ? 'text' : 'password'}
                        error={!!errors.password}
                        helperText={errors.password?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowPassword(!showPassword)}
                                edge="end"
                              >
                                {showPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* 确认密码 */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="confirmPassword"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="确认密码"
                        type={showConfirmPassword ? 'text' : 'password'}
                        error={!!errors.confirmPassword}
                        helperText={errors.confirmPassword?.message}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <Lock />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                edge="end"
                              >
                                {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {activeStep === 1 && (
              <Grid container spacing={3}>
                {/* 验证码 */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="verificationCode"
                    control={control}
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        label="短信验证码"
                        error={!!errors.verificationCode}
                        helperText={errors.verificationCode?.message}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              <Button
                                variant="outlined"
                                size="small"
                                onClick={sendVerificationCode}
                                disabled={countdown > 0 || loading}
                                startIcon={loading ? <CircularProgress size={16} /> : <Send />}
                              >
                                {countdown > 0 ? `${countdown}s` : '发送验证码'}
                              </Button>
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                  />
                </Grid>

                {/* 性别 */}
                <Grid item xs={12} sm={6}>
                  <Controller
                    name="gender"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.gender}>
                        <InputLabel>性别</InputLabel>
                        <Select {...field} label="性别">
                          <MenuItem value="male">男</MenuItem>
                          <MenuItem value="female">女</MenuItem>
                          <MenuItem value="other">其他</MenuItem>
                        </Select>
                        {errors.gender && (
                          <Typography variant="caption" color="error">
                            {errors.gender.message}
        </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>

                {/* 出生年份 */}
                <Grid item xs={12}>
                  <Controller
                    name="birthYear"
                    control={control}
                    render={({ field }) => (
                      <FormControl fullWidth error={!!errors.birthYear}>
                        <InputLabel>出生年份</InputLabel>
                        <Select {...field} label="出生年份">
                          {years.map((year) => (
                            <MenuItem key={year} value={year}>
                              {year}年
                            </MenuItem>
                          ))}
                        </Select>
                        {errors.birthYear && (
                          <Typography variant="caption" color="error">
                            {errors.birthYear.message}
        </Typography>
                        )}
                      </FormControl>
                    )}
                  />
                </Grid>
              </Grid>
            )}

            {/* 按钮组 */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                上一步
              </Button>
              
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/login"
                >
                  已有账户？去登录
                </Button>
                
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} /> : null}
                >
                  {activeStep === steps.length - 1 ? '完成注册' : '下一步'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
};

export default RegisterPage; 