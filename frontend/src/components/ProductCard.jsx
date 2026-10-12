import { useState } from 'react';
import { Link } from 'react-router-dom';
import { addToWishlist } from '../services/api';
import { useCart } from '../context/useCart';

export default function ProductCard({ product, isWishlisted = false, onWishlistChange }) {
    const [saving, setSaving] = useState(false);
    const [adding, setAdding] = useState(false);
    const [saveState, setSaveState] = useState(isWishlisted ? 'saved' : 'idle');
    const [errorMessage, setErrorMessage] = useState('');
    const isInStock = product.stock > 0;
    const { addProduct } = useCart();

    const handleAddToCart = async () => {
        if (adding || !isInStock) return;

        setAdding(true);
        setErrorMessage('');
        try {
            await addProduct(product._id);
        } catch (err) {
            setErrorMessage(err?.response?.data?.message || 'Unable to add product to cart. Please try again.');
        } finally {
            setAdding(false);
        }
    };

    const handleWishlistToggle = async () => {
        if (saving) return;

        setSaving(true);
        setErrorMessage('');

        try {
            await addToWishlist(product._id);
            setSaveState('saved');
            if (onWishlistChange) onWishlistChange(product._id, true);
        } catch (err) {
            const message = err?.response?.data?.message || 'Unable to save product. Please try again.';
            if (err?.response?.status === 409) {
                setSaveState('saved');
                if (onWishlistChange) onWishlistChange(product._id, true);
            } else {
                setSaveState('error');
                setErrorMessage(message);
            }
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="product-card">
            <img src={product.image} alt={product.name} className="product-image" />

            <div className="product-card-body">
                <div className="product-card-header">
                    <h3>{product.name}</h3>
                    <span className="product-category">{product.category}</span>
                </div>

                <p className="product-price">₹{product.price.toLocaleString('en-IN')}</p>

                <div className="stock-row">
                    <span className={`stock-badge ${isInStock ? 'in-stock' : 'out-of-stock'}`}>
                        {isInStock ? `${product.stock} units left` : 'Out of stock'}
                    </span>
                </div>

                <div className="product-card-actions">
                    <Link to={`/products/${product._id}`} className="view-details-button">
                        View Details
                    </Link>

                    <button
                        type="button"
                        className="cart-button"
                        onClick={handleAddToCart}
                        disabled={adding || !isInStock}
                    >
                        {adding ? 'Adding...' : isInStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>

                    <button
                        type="button"
                        className={`wishlist-button ${saveState === 'saved' ? 'saved' : ''}`}
                        onClick={handleWishlistToggle}
                        disabled={saving || saveState === 'saved'}
                    >
                        {saving ? '⏳ Saving...' : saveState === 'saved' ? '♥ Added to Wishlist' : '♡ Add to Wishlist'}
                    </button>
                </div>

                {errorMessage && <p className="wishlist-error">{errorMessage}</p>}
            </div>
        </div>
    );
}
