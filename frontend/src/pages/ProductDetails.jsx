import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById } from '../services/api';
import Navbar from '../components/Navbar';
import { useCart } from '../context/useCart';

export default function ProductDetails() {
    const { id } = useParams();
    const { addProduct } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [adding, setAdding] = useState(false);
    const [cartMessage, setCartMessage] = useState('');

    useEffect(() => {
        const fetchProduct = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await getProductById(id);
                setProduct(response.data);
            } catch {
                setError('Something went wrong while loading the product.');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchProduct();
        }
    }, [id]);

    const handleAddToCart = async () => {
        setAdding(true);
        setCartMessage('');
        try {
            await addProduct(product._id);
            setCartMessage('Added to your cart.');
        } catch (err) {
            setCartMessage(err?.response?.data?.message || 'Unable to add product to cart.');
        } finally {
            setAdding(false);
        }
    };

    return (
        <div className="app-page">
            <Navbar />

            <main className="product-detail-page">
                {loading && (
                    <div className="state-box">
                        <p>Loading product...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-box state-error">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && !product && (
                    <div className="state-box state-empty">
                        <p>Product not found.</p>
                    </div>
                )}

                {!loading && !error && product && (
                    <div className="product-detail-card">
                        <img src={product.image} alt={product.name} className="product-detail-image" />

                        <div className="product-detail-info">
                            <div className="detail-badges">
                                <span className="product-category">{product.category}</span>
                                <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                                </span>
                            </div>

                            <h1>{product.name}</h1>
                            <p className="product-detail-price">₹{product.price.toLocaleString('en-IN')}</p>
                            <p className="product-description">{product.description}</p>

                            <div className="info-list">
                                <div>
                                    <span>Category</span>
                                    <strong>{product.category}</strong>
                                </div>
                                <div>
                                    <span>Stock</span>
                                    <strong>{product.stock}</strong>
                                </div>
                            </div>

                            <div className="detail-actions">
                                <button
                                    type="button"
                                    className="primary-button detail-button"
                                    onClick={handleAddToCart}
                                    disabled={adding || product.stock < 1}
                                >
                                    {adding ? 'Adding...' : product.stock < 1 ? 'Out of Stock' : 'Add to Cart'}
                                </button>
                                <Link to="/products" className="secondary-link">
                                    Back to Products
                                </Link>
                            </div>
                            {cartMessage && <p className="cart-feedback" role="status">{cartMessage}</p>}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
