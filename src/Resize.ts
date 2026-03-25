import { useState, useEffect, useCallback } from 'react';

export function useWindowResize() {
    // 初期値を設定
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });

    // useCallbackでイベントハンドラをメモ化
    // 依存配列が空なので、この関数はコンポーネントのライフサイクルを通して一度だけ作成される
    const handleResize = useCallback(() => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }, []);

    useEffect(() => {
        // リサイズイベントのリスナーを追加
        window.addEventListener('resize', handleResize);

        // クリーンアップ関数でリスナーを削除
        return () => window.removeEventListener('resize', handleResize);
    }, [handleResize]); // handleResizeが変更された場合のみ再実行

    console.log('[RESIZE]', window.innerWidth, window.innerHeight);

    return windowSize;

}

export default useWindowResize;
