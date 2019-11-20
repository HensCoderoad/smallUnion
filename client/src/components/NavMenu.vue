<template>
  <div>
    <template v-for="item in navMenus">
      <el-submenu v-if="item.children && item.children.length" :index="item.path">
        <template slot="title">
          <i class="el-icon-menu"></i>
          <span>{{item.name}}</span>
        </template>
        <NavMenu :navMenus="item.children"></NavMenu>
      </el-submenu>
      <el-menu-item v-else :index="item.path">
        <i v-if="!item.parent_id" class="el-icon-location"></i>
        <span>{{item.name}}</span>
      </el-menu-item>
    </template>
  </div>
</template>
<script>
export default {
  name: 'NavMenu',
  props: ['navMenus']
}

</script>
