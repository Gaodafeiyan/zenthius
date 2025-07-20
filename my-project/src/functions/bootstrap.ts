export default ({ strapi }: any) => {
  // 应用启动时运行迁移
  strapi.db.migrate();
}; 