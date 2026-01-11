
export const cryptoUtils = {
  /**
   * 生成桌號驗證雜湊
   * 結合 UserAgent + 當前日期 (YYYY-MM-DD) + 桌號
   */
  generateTableHash: (tableNo: string): string => {
    const date = new Date().toISOString().split('T')[0];
    const ua = navigator.userAgent;
    const raw = `${ua}-${date}-${tableNo}`;
    
    // 簡單的 Base64 編碼模擬雜湊（POC 階段使用）
    return btoa(raw).replace(/[^a-zA-Z0-9]/g, '').slice(-12);
  },
  
  /**
   * 驗證雜湊是否匹配
   */
  validateHash: (tableNo: string, hash: string): boolean => {
    return cryptoUtils.generateTableHash(tableNo) === hash;
  }
};
