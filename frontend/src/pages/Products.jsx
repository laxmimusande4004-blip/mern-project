import { useEffect, useState } from 'react';
import { getProducts } from '../services/api';
import ProductCard from '../components/ProductCard';
import Navbar from '../components/Navbar';

const categories = ['All Categories', 'Electronics', 'Fashion', 'Books', 'Home'];

export default function Products() {
    const [products, setProducts] = useState([]);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All Categories');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError('');

            try {
                const response = await getProducts({
                    search,
                    category: category === 'All Categories' ? '' : category,
                });

                setProducts(response.data.products || []);
            } catch (err) {
                setError('Something went wrong while loading products.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [search, category]);

    return (
        <div className="app-page">
            <Navbar />

            <main className="product-page">
                <section className="product-header">
                    <div>
                        <p className="eyebrow">ShopKart</p>
                        <h1>Discover Products</h1>
                    </div>
                </section>

                <div className="product-toolbar">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                        placeholder="Search products..."
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="category-select"
                    >
                        {categories.map((option) => (
                            <option key={option} value={option}>
                                {option}
                            </option>
                        ))}
                    </select>
                </div>

                {loading && (
                    <div className="state-box">
                        <p>Loading products...</p>
                    </div>
                )}

                {!loading && error && (
                    <div className="state-box state-error">
                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && products.length === 0 && (
                    <div className="state-box state-empty">
                        <p>No products found.</p>
                    </div>
                )}

                {!loading && !error && products.length > 0 && (
                    <div className="product-grid">
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
