<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card class="box-card">
      <!-- 输入框与搜索框 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- clearable @clear="getUserList" 可清空搜索框以及更新表格数据 -->
          <el-input
            placeholder="请输入内容"
            class="input-with-select"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="6">
          <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表展示 -->
      <el-table :data="userList" :border="true" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="username" label="用户名"></el-table-column>
        <el-table-column prop="mobile" label="手机号"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column prop="role_name" label="角色"></el-table-column>
        <el-table-column prop="mg_state" label="状态">
          <template slot-scope="scope">
            <!-- {{scope.row}} -->
            <el-switch
              v-model="scope.row.mg_state"
              active-color="#13ce66"
              @change="changeUserState(scope.row)"
            ></el-switch>
          </template>
        </el-table-column>
        <el-table-column prop="operation" label="操作">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="deleteUser(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip
              class="item"
              effect="dark"
              content="分配角色"
              placement="top"
              :enterable="false"
            >
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="setRole(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10,20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户" :visible.sync="addDialogVisible" width="50%" @close="addDialogClosed">
      <!-- 表单 -->
      <el-form
        :model="addUserForm"
        :rules="addUserRules"
        ref="ruleFormRef"
        label-width="120px"
        class="demo-ruleForm"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addUserForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addUserForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addUserForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addUserForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑用户信息对话框 -->
    <el-dialog title="提示" :visible.sync="editDialogVisible" width="30%" @close="editDialogClosed">
      <el-form ref="edifFormRef" :model="editFormData" :rules="addUserRules" label-width="70px">
        <el-form-item label="用户名">
          <el-input v-model="editFormData.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editFormData.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editFormData.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveUserData">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配角色对话框 -->
    <el-dialog title="分配角色" :visible.sync="isShowAllotRoleDialog" width="30%">
      <div>
        <p>用户名:{{userInfo.username}}</p>
        <p>当前角色:{{userInfo.role_name}}</p>
        <p>
          分配新角色:
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id"
            ></el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowAllotRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="saveUserRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { async } from "q";
export default {
  data() {
    // 自定义校验规则
    // 校验邮箱
    const checkEmail = (rule, value, callback) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        return callback();
      }
      callback(new Error("邮箱格式不正确"));
    };
    const checkMobile = (rule, value, callback) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return callback();
      }
      callback(new Error("手机号格式不正确"));
    };
    return {
      queryInfo: {
        query: "",
        // 当前页
        pagenum: 1,
        // 当前每页显示的条数
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      isShowAllotRoleDialog: false,
      // 添加用户表单数据
      addUserForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      // 添加用户校验规则
      addUserRules: {
        username: [
          { required: true, message: "请输入用户名", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 6, max: 15, message: "长度在 6 到 15 个字符", trigger: "blur" }
        ],
        email: [
          { required: false, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: false, message: "请输入手机号", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      // 查询到的用户信息
      editFormData: {},
      // 用户信息
      userInfo: {},
      // 角色列表
      roleList: [],
      // 选中的角色id
      selectedRoleId: ''
    };
  },
  created() {
    this.getUserList();
  },
  methods: {
    async getUserList() {
      // console.log("=======");
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200)
        return this.$message.error("获取用户列表失败");

      this.userList = res.data.users;
      this.total = res.data.total;
      // console.log(res);
    },
    // 监听每页数量变化
    handleSizeChange(newSize) {
      // console.log(`每页 ${newSize} 条`);
      this.queryInfo.pagesize = newSize;
      // 每页的数据大小已改变，需要重新请求数据
      this.getUserList();
    },
    // 监听当前页
    handleCurrentChange(newPage) {
      console.log(`当前页: ${newPage}`);
      this.queryInfo.pagenum = newPage;
      this.getUserList();
    },
    // 监听用户状态的变化，value值为新状态的user对象
    async changeUserState(value) {
      // console.log(value);
      const { data: res } = await this.$http.put(
        `users/${value.id}/state/${value.mg_state}`
      );
      console.log(res);
      if (res.meta.status !== 200) {
        value.mg_state = !value.mg_state;
        return this.$message.error("用户状态修改失败");
      }

      this.$message.success("用户状态更新成功");
    },
    // 监听对话框的关闭
    addDialogClosed() {
      this.$refs.ruleFormRef.resetFields();
    },
    // 点击确定按钮，添加用户
    addUser() {
      this.$refs.ruleFormRef.validate(async value => {
        if (!value) return;

        // 发起真正的网络请求
        const { data: res } = await this.$http.post("users", this.addUserForm);
        console.log(res);
        if (res.meta.status !== 201) {
          return this.$message.error("添加用户失败");
        }
        this.$message.success("添加用户成功");
        this.addDialogVisible = false;
        this.getUserList();
      });
    },
    // 监听用户对话框
    async showEditDialog(id) {
      const { data: res } = await this.$http.get(`/users/${id}`);

      if (res.meta.status !== 200) {
        return this.$message.error("查询用户信息失败");
      }
      // console.log(res);
      this.editFormData = res.data;
      this.editDialogVisible = true;
    },
    // 关闭对话框，重置
    editDialogClosed() {
      this.$refs.edifFormRef.resetFields();
    },
    // 保存新修改的用户数据
    saveUserData() {
      this.$refs.edifFormRef.validate(async valid => {
        if (!valid) return;
        const { data: res } = await this.$http.put(
          "/users/" + this.editFormData.id,
          { email: this.editFormData.email, mobile: this.editFormData.mobile }
        );
        if (res.meta.status !== 200) {
          return this.$message.error("用户信息修改失败");
        }
        // 关闭对话框
        this.editDialogVisible = false;
        //刷新数据
        this.getUserList();
        // 提示修改成功
        this.$message.success("用户信息修改成功");
      });
    },
    deleteUser(id) {
      this.$confirm("此操作将永久删除该用户, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async result => {
          const { data: res } = await this.$http.delete("users/" + id);
          if (res.meta.status !== 200)
            return this.$message.error("删除用户失败");
          this.getUserList();
          return this.$message.success("删除用户成功");
        })
        .catch(err => {
          return this.$message.info("已取消删除用户");
        });
    },
    // 展示角色对话框
    async setRole(userInfo) {
      // 查询角色信息
      this.userInfo = userInfo;
      //查询角色列表

      const { data: res } = await this.$http.get("/roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }
      this.roleList = res.data;
      this.isShowAllotRoleDialog = true;
      console.log(res);
    },
    // 保存用户角色信息
   async saveUserRoleInfo(){
      if(!this.selectedRoleId){
        return this.$message.info("请选择要分配的角色");
      }

     const {data:res} =await this.$http.put(`users/${this.userInfo.id}/role`,{
        rid: this.selectedRoleId
      });
      if(res.meta.status!==200){
        return this.$message.error("分配角色失败");
      }

      this.getUserList();
      this.$message.success("分配角色成功");
      this.isShowAllotRoleDialog=false;
    }
  }
};
</script>
  
<style lang="less" scoped>
.el-pagination {
  margin-top: 15px;
}
</style>