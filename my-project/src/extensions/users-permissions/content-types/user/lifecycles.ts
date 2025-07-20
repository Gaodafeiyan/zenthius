import { nanoid } from 'nanoid';

export default {
  beforeCreate: async (event: any) => {
    const { data } = event.params;
    
    // 生成 9 位 diamondId
    data.diamondId = nanoid(9);
    
    // 生成 8 位 referralCode
    data.referralCode = nanoid(8);
  },
}; 