const { strapi } = require('@strapi/strapi');

(async () => {
  try {
    await strapi().load();
    const roles = await strapi.db.query('plugin::users-permissions.role').count();
    if (roles < 3) {
      throw new Error('Roles table corrupted!');
    }
    console.log('✅ Roles check passed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Roles check failed:', error.message);
    process.exit(1);
  }
})(); 