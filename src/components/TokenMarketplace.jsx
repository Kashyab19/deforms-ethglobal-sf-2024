import React, { useState, useEffect } from 'react';
import '../styles/TokenMarketplace.css';

function TokenCard({ token, onPurchase, onSell, isOwner }) {
    return (
        <div className="token-card">
            <h3>{token.title}</h3>
            <p>Category: {token.category}</p>
            <p>Data Size: {token.dataSize} bytes</p>
            <p>Creation Date: {new Date(token.creationDate * 1000).toLocaleDateString()}</p>
            {isOwner ? (
                <button onClick={() => onSell(token.id)} className="sell-button">Sell Token</button>
            ) : (
                <button onClick={() => onPurchase(token.id)} className="purchase-button">Purchase Token</button>
            )}
        </div>
    );
}

function TokenMarketplace({ dataTokenContract, userAddress }) {
    const [tokens, setTokens] = useState([]);

    useEffect(() => {
        fetchTokens();
    }, []);

    const fetchTokens = async () => {
        // In a real implementation, you would fetch tokens from your contract or a backend
        // For now, we'll use dummy data
        const dummyTokens = [
            { id: 1, title: "Survey Result 1", category: "Health", dataSize: 1024, creationDate: Date.now() / 1000, owner: "0x123..." },
            { id: 2, title: "Survey Result 2", category: "Education", dataSize: 2048, creationDate: Date.now() / 1000, owner: userAddress },
            // Add more dummy tokens as needed
        ];
        setTokens(dummyTokens);
    };

    const handlePurchase = async (tokenId) => {
        try {
            // Here you would call your contract's purchase function
            console.log(`Purchasing token ${tokenId}`);
            // After successful purchase, refetch tokens
            await fetchTokens();
        } catch (error) {
            console.error("Error purchasing token:", error);
        }
    };

    const handleSell = async (tokenId) => {
        try {
            // Here you would call your contract's sell function
            console.log(`Selling token ${tokenId}`);
            // After successful sale, refetch tokens
            await fetchTokens();
        } catch (error) {
            console.error("Error selling token:", error);
        }
    };

    return (
        <div className="token-marketplace">
            <h2>Token Marketplace</h2>
            <div className="token-grid">
                {tokens.map(token => (
                    <TokenCard 
                        key={token.id} 
                        token={token} 
                        onPurchase={handlePurchase} 
                        onSell={handleSell}
                        isOwner={token.owner === userAddress}
                    />
                ))}
            </div>
        </div>
    );
}

export default TokenMarketplace;
