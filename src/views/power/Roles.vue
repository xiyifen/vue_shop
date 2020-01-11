<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddRoleDialog">添加角色</el-button>
        </el-col>
      </el-row>

      <el-table :data="roleList">
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',i1===0?'bdtop':'','vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 渲染一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row,item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 渲染二级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2===0? '':'bdtop','vcenter']"
                  v-for="(item2,i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row,item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <!-- 三级权限 -->
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="item3 in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeRightById(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="roleName" label="角色名称"></el-table-column>
        <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
        <el-table-column label="操作" width="360">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="primary"
              icon="el-icon-edit"
              @click="findRoleById(scope.row.id)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              @click="deleteRoleById(scope.row.id)"
            >删除</el-button>
            <el-button
              size="mini"
              type="warning"
              icon="el-icon-setting"
              @click="showSetRightsDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加角色对话框  -->
    <el-dialog title="提示" :visible.sync="isShowAddRoleDialog" width="30%" @close="editDialogClosed">
      <el-form ref="ruleFormRef" :model="addFormData" label-width="80px">
        <!-- 添加用户对话框 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addFormData.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addFormData.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowAddRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑角色对话框 -->
    <el-dialog
      title="提示"
      :visible.sync="isShowEditRoleDialog"
      width="30%"
      @close="editDialogClosed"
    >
      <el-form ref="editRoleFormRef" :model="editFormData" label-width="80px">
        <!-- 添加用户对话框 -->
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editFormData.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editFormData.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowEditRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="updateUser">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 权限树对话框 -->
    <el-dialog title="提示" :visible.sync="isShowRightsDialog" width="30%" @close="setRightsDialogClosed">
      <!-- 树形控件 -->
      <el-tree
        :data="rightsList"
        :props="rightsProps"
        :default-checked-keys="defKeys"
        node-key="id"
        show-checkbox
        default-expand-all
        ref="treeRef"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="isShowRightsDialog = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表
      roleList: [],
      // 是否展示添加角色对话框
      isShowAddRoleDialog: false,
      isShowEditRoleDialog: false,
      // 是否展示获取权限对话框
      isShowRightsDialog: false,
      addFormData: {
        roleName: "",
        roleDesc: ""
      },
      editFormData: {},
      // 权限列表
      rightsList: [],
      rightsProps: {
        children: "children",
        label: "authName"
      },
      // 默认选中的树节点
      defKeys: [],
      roleId: Number
    };
  },
  created() {
    this.getRoleList();
  },
  methods: {
    // 获取所有的角色列表
    async getRoleList() {
      const { data: res } = await this.$http.get("/roles");
      if (res.meta.status !== 200) {
        return this.$message.error("获取角色列表失败");
      }

      this.roleList = res.data;
      // console.log(this.roleList);
    },
    // 点击添加角色按钮，弹出添加角色对话框
    showAddRoleDialog() {
      this.isShowAddRoleDialog = true;
    },
    // 关闭对话框
    // roleDialogClosed(){
    //   // this.$refs.roleFormRef.resetFields();
    //   this.$refs.roleFormRef.resetFields();
    // },
    // 监听对话框的关闭
    addDialogClosed() {
      this.$refs.ruleFormRef.resetFields();
    },
    // 点击对话框确定按钮，执行新增操作
    async addUser() {
      //  TODO:  先对表单数据进行校验
      const { data: res } = await this.$http.post("/roles", this.addFormData);
      //  console.log(res);
      if (res.meta.status !== 201) return this.$message.error("新增角色失败");
      this.isShowAddRoleDialog = false;
      this.getRoleList();
    },
    // 根据角色id查找角色
    async findRoleById(id) {
      this.isShowEditRoleDialog = true;
      const { data: res } = await this.$http.get("/roles/" + id);
      if (res.meta.status !== 200) return this.$message.error("查找用户失败");
      this.editFormData = res.data;
      console.log(this.editFormData);
    },
    // 更新角色
    async updateUser() {
      // TODO: 先进行整个表单的校验，通过后执行更新操作
      const { data: res } = await this.$http.put(
        "roles/" + this.editFormData.roleId,
        {
          roleName: this.editFormData.roleName,
          roleDesc: this.editFormData.roleDesc
        }
      );
      if (res.meta.status !== 200) return this.$message.error("更新角色失败");
      this.isShowEditRoleDialog = false;
      this.getRoleList();
      this.$message.success("更新角色成功");
      // console.log(this.editFormData.roleId);
    },
    // 重置表单
    editDialogClosed() {
      this.$refs.editRoleFormRef.resetFields();
    },
    // 删除角色
    async deleteRoleById(id) {
      console.log(id);
      const isConfirmDeleteResult = await this.$confirm(
        "此操作将永久删除该角色, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => {
        return error;
      });
      if (isConfirmDeleteResult !== "confirm")
        return this.$message.info("已取消删除角色");
      const { data: res } = await this.$http.delete("/roles/" + id);
      if (res.meta.status !== 200) return this.$message.error("删除角色失败");
      this.getRoleList();
      this.$message.success("删除角色成功");
    },
    // 通过id删除权限
    async removeRightById(role, rightsId) {
      const confirmResult = await this.$confirm(
        "此操作将永久删除该权限, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).catch(error => error);
      if (confirmResult !== "confirm") {
        return this.$message.info("已取消删除该权限");
      }

      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightsId}`
      );
      if (res.meta.status !== 200) {
        return this.$message.error("删除权限失败");
      }
      //  此处不重新调用 this.getRoleList() 会刷新整个表格
      // this.getRoleList()
      // 由于动态绑定,更新role的children即可
      role.children = res.data;
      console.log(res.data);
    },
    // 展示设置权限对话框
    async showSetRightsDialog(node) {
       this.roleId=node.id;
      const { data: res } = await this.$http.get("/rights/tree");
      this.rightsList = res.data;
      if (res.meta.status !== 200) {
        this.$message.error("获取权限数据失败");
      }
      this.getRightLeafIds(node, this.defKeys);
      this.isShowRightsDialog = true;
    },
    // 递归获取角色的第三级权限id
    getRightLeafIds(node, arr) {
      if (!node.children) {
        return arr.push(node.id);
      }
      node.children.forEach(item => {
        this.getRightLeafIds(item, arr);
      });
    },
    // 监听权限对话框的关闭,关闭时应清空defKeys数据
    setRightsDialogClosed(){
      this.defKeys=[]
    },
    async allotRights(){
       const checkedKeys=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      
      const keyStr=checkedKeys.join(",");

      const {data:res}= await this.$http.post(`roles/${this.roleId}/rights`,{rids: keyStr})
      if(res.meta.status!==200){
        return this.$message.error("角色分配权限失败");
      }
      this.getRoleList();
      this.$message.success(res.meta.msg)
      this.isShowRightsDialog=false;  
    }
  }
};
</script>

<style lang="less" scoped>
.el-tag {
  margin: 7px;
}
.bdtop {
  border-top: 1px solid #eeeeee;
}
.bdbottom {
  border-bottom: 1px solid #eeeeee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>>