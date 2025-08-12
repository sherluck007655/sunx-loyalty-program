import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Form, InputGroup } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaPlay, FaSearch, FaFilter, FaClock, FaEye } from 'react-icons/fa';
import api from '../services/api';

const Training = () => {
    const [categories, setCategories] = useState([]);
    const [featuredVideos, setFeaturedVideos] = useState([]);
    const [popularVideos, setPopularVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesRes, featuredRes, popularRes] = await Promise.all([
                api.get('/training/categories'),
                api.get('/training/featured'),
                api.get('/training/popular')
            ]);

            setCategories(categoriesRes.data.data);
            setFeaturedVideos(featuredRes.data.data);
            setPopularVideos(popularRes.data.data);
        } catch (err) {
            setError('Failed to load training content');
            console.error('Error fetching training data:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            window.location.href = `/training/search?q=${encodeURIComponent(searchQuery)}`;
        }
    };

    const formatDuration = (seconds) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m`;
        }
        return `${minutes}m`;
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'beginner': return 'success';
            case 'intermediate': return 'warning';
            case 'advanced': return 'danger';
            default: return 'secondary';
        }
    };

    if (loading) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading training content...</p>
            </Container>
        );
    }

    return (
        <Container className="py-4">
            {/* Header */}
            <div className="text-center mb-5">
                <h1 className="display-4 fw-bold text-primary mb-3">
                    <FaPlay className="me-3" />
                    Training Center
                </h1>
                <p className="lead text-muted">
                    Master your skills with our comprehensive training videos
                </p>
            </div>

            {/* Search Bar */}
            <Row className="mb-5">
                <Col lg={8} className="mx-auto">
                    <Form onSubmit={handleSearch}>
                        <InputGroup size="lg">
                            <Form.Control
                                type="text"
                                placeholder="Search training videos..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button className="btn btn-primary" type="submit">
                                <FaSearch />
                            </button>
                        </InputGroup>
                    </Form>
                </Col>
            </Row>

            {error && (
                <Alert variant="danger" className="mb-4">
                    {error}
                </Alert>
            )}

            {/* Featured Videos */}
            {featuredVideos.length > 0 && (
                <section className="mb-5">
                    <h2 className="h3 mb-4">
                        <Badge bg="warning" className="me-2">Featured</Badge>
                        Recommended Training
                    </h2>
                    <Row>
                        {featuredVideos.map((video) => (
                            <Col lg={6} xl={4} key={video._id} className="mb-4">
                                <Card className="h-100 shadow-sm hover-shadow">
                                    <div className="position-relative">
                                        <Card.Img
                                            variant="top"
                                            src={video.thumbnailUrl || '/images/video-placeholder.jpg'}
                                            style={{ height: '200px', objectFit: 'cover' }}
                                        />
                                        <div className="position-absolute top-0 end-0 m-2">
                                            <Badge bg={getDifficultyColor(video.difficulty)}>
                                                {video.difficulty}
                                            </Badge>
                                        </div>
                                        <div className="position-absolute bottom-0 end-0 m-2">
                                            <Badge bg="dark">
                                                <FaClock className="me-1" />
                                                {formatDuration(video.duration)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                        <div className="mb-2">
                                            <small className="text-muted">
                                                {video.categoryId?.name}
                                            </small>
                                        </div>
                                        <Card.Title className="h5 mb-2">
                                            {video.title}
                                        </Card.Title>
                                        <Card.Text className="text-muted small flex-grow-1">
                                            {video.description.substring(0, 100)}...
                                        </Card.Text>
                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            <small className="text-muted">
                                                <FaEye className="me-1" />
                                                {video.viewCount} views
                                            </small>
                                            <Link
                                                to={`/training/video/${video._id}`}
                                                className="btn btn-primary btn-sm"
                                            >
                                                Watch Now
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>
            )}

            {/* Training Categories */}
            <section className="mb-5">
                <h2 className="h3 mb-4">Training Categories</h2>
                <Row>
                    {categories.map((category) => (
                        <Col lg={6} xl={4} key={category._id} className="mb-4">
                            <Link
                                to={`/training/category/${category._id}`}
                                className="text-decoration-none"
                            >
                                <Card className="h-100 shadow-sm hover-shadow category-card">
                                    <Card.Body className="text-center p-4">
                                        <div className="mb-3">
                                            <i className={`${category.icon} fa-3x text-primary`}></i>
                                        </div>
                                        <Card.Title className="h5 mb-2">
                                            {category.name}
                                        </Card.Title>
                                        <Card.Text className="text-muted small mb-3">
                                            {category.description}
                                        </Card.Text>
                                        <div className="d-flex justify-content-center gap-3">
                                            <Badge bg="primary">
                                                {category.videoCount} videos
                                            </Badge>
                                            <Badge bg="secondary">
                                                {formatDuration(category.totalDuration)}
                                            </Badge>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Link>
                        </Col>
                    ))}
                </Row>
            </section>

            {/* Popular Videos */}
            {popularVideos.length > 0 && (
                <section className="mb-5">
                    <h2 className="h3 mb-4">
                        <Badge bg="info" className="me-2">Popular</Badge>
                        Most Watched
                    </h2>
                    <Row>
                        {popularVideos.slice(0, 6).map((video) => (
                            <Col lg={6} xl={4} key={video._id} className="mb-4">
                                <Card className="h-100 shadow-sm hover-shadow">
                                    <div className="position-relative">
                                        <Card.Img
                                            variant="top"
                                            src={video.thumbnailUrl || '/images/video-placeholder.jpg'}
                                            style={{ height: '180px', objectFit: 'cover' }}
                                        />
                                        <div className="position-absolute bottom-0 end-0 m-2">
                                            <Badge bg="dark">
                                                <FaClock className="me-1" />
                                                {formatDuration(video.duration)}
                                            </Badge>
                                        </div>
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                        <div className="mb-2">
                                            <small className="text-muted">
                                                {video.categoryId?.name}
                                            </small>
                                        </div>
                                        <Card.Title className="h6 mb-2">
                                            {video.title}
                                        </Card.Title>
                                        <div className="d-flex justify-content-between align-items-center mt-auto">
                                            <small className="text-muted">
                                                <FaEye className="me-1" />
                                                {video.viewCount} views
                                            </small>
                                            <Link
                                                to={`/training/video/${video._id}`}
                                                className="btn btn-outline-primary btn-sm"
                                            >
                                                Watch
                                            </Link>
                                        </div>
                                    </Card.Body>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </section>
            )}
        </Container>
    );
};

export default Training;
