<template>
  <div class="login-container">
    <div class="login-box">
      <!-- 头像区域 -->
      <div class="avatar-box">
        <img src="~assets/logo.png" alt />
      </div>

      <!-- 登录表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" label-width="0px" class="login-form">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input
            type="password"
            prefix-icon="iconfont icon-3702mima"
            v-model="loginForm.password"
          ></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button type="info" @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  name: "Login",
  data() {
    return {
      //   表单对象
      loginForm: {
        username: "admin",
        password: "123456"
      },
      // 验证规则对象
      loginFormRules: {
        username: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
            { required: true, message: "请输入用户密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ]
      }
    };
  },
  methods: {
      // 点击重置按钮，重置登录表单
      reset(){
        //   console.log(this);
        //对整个表单进行重置，将所有字段值重置为初始值并移除校验结果，loginFormRef为<el-form>标签上定义的ref
        this.$refs.loginFormRef.resetFields()

      },
      login(){
          //对整个表单进行校验的方法,预验证
          this.$refs.loginFormRef.validate( async valid=>{
            //   console.log(valid);
              if(!valid) return;

              const {data:res}=await this.$http.post("login",this.loginForm);
              if(res.meta.status!==200) 
                return this.$message.error("用户名或密码错误");
              this.$message.success("登录成功");
              // 1.登录之后应将 token 保存到客户端的sessionStorage中
              // 1.1 项目中除了登录之外的其他API接口，必须在登录之后才能访问
              // 1.2 token只应在当前网站打开期间生效，所以将token 保存在 sessionStorage 中
              window.sessionStorage.setItem('token',res.data.token);
              // 登录成功后路由到主页 /home
              this.$router.push("/home");

          })
      }
  }
};
</script>

<style lang="less" scoped>
.login-container {
  background-color: #2b4b6b;
  height: 100%;
}
.login-box {
  width: 450px;
  height: 300px;
  background-color: #ffffff;

  border-radius: 3px;

  position: absolute;
  left: 50%;
  top: 50%;

  transform: translate(-50%, -50%);

  .avatar-box {
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;

    position: absolute;
    left: 50%;
    transform: translate(-50%, -50%);

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #eee;
    }
  }
}
.login-form {
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}
.btns {
  display: flex;
  justify-content: flex-end;
}
</style>>

