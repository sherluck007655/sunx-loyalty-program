import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Spinner, Alert, Form, Button, Breadcrumb } from 'react-bootstrap';
import { FaPlay, FaClock, FaEye, FaArrowLeft, FaFilter } from 'react-icons/fa';
import api from '../services/api';

const TrainingCategory = () => {
    const { categoryId } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [difficultyFilter, setDifficultyFilter] = useState('');

    useEffect(() => {
        fetchCategoryVideos();
    }, [categoryId, currentPage, difficultyFilter]);

    const fetchCategoryVideos = async () => {
        try {
            setLoading(true);
            const params = {
                page: currentPage,
                limit: 12
            };
            
            if (difficultyFilter) {
                params.difficulty = difficultyFilter;
            }

            const response = await api.get(`/training/categories/${categoryId}/videos`, { params });
            setData(response.data.data);
        } catch (err) {
            setError('Failed to load category videos');
            console.error('Error fetching category videos:', err);
        } finally {
            setLoading(false);
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

    const handlePageChange = (page) => {
        setCurrentPage(page);
        window.scrollTo(0, 0);
    };

    if (loading && !data) {
        return (
            <Container className="py-5 text-center">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
                <p className="mt-3">Loading videos...</p>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className="py-5">
                <Alert variant="danger">{error}</Alert>
                <Link to="/training" className="btn btn-primary">
                    <FaArrowLeft className="me-2" />
                    Back to Training
                </Link>
            </Container>
        );
    }

    const { videos, category, pagination } = data || {};

    return (
        <Container className="py-4">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-4">
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
                    Home
                </Breadcrumb.Item>
                <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/training" }}>
                    Training
                </Breadcrumb.Item>
                <Breadcrumb.Item active>
                    {category?.name}
                </Breadcrumb.Item>
            </Breadcrumb>

            {/* Category Header */}
            {category && (
                <div className="text-center mb-5">
                    <div className="mb-3">
                        <i className={`${category.icon} fa-4x text-primary`}></i>
                    </div>
                    <h1 className="display-5 fw-bold mb-3">{category.name}</h1>
                    <p className="lead text-muted mb-4">{category.description}</p>
                    <div className="d-flex justify-content-center gap-3">
                        <Badge bg="primary" className="fs-6 px-3 py-2">
                            {videos?.length || 0} videos
                        </Badge>
                        <Badge bg="secondary" className="fs-6 px-3 py-2">
                            {formatDuration(category.totalDuration)}
                        </Badge>
                    </div>
                </div>
            )}

            {/* Filters */}
            <Row className="mb-4">
                <Col md={6}>
                    <Link to="/training" className="btn btn-outline-secondary">
                        <FaArrowLeft className="me-2" />
                        Back to Training
                    </Link>
                </Col>
                <Col md={6} className="text-md-end">
                    <Form.Select
                        value={difficultyFilter}
                        onChange={(e) => {
                            setDifficultyFilter(e.target.value);
                            setCurrentPage(1);
                        }}
                        style={{ width: 'auto', display: 'inline-block' }}
                    >
                        <option value="">All Levels</option>
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                    </Form.Select>
                </Col>
            </Row>

            {/* Videos Grid */}
            {videos && videos.length > 0 ? (
                <>
                    <Row>
                        {videos.map((video) => (
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
                                        <div className="position-absolute top-50 start-50 translate-middle">
                                            <Link
                                                to={`/training/video/${video._id}`}
                                                className="btn btn-primary btn-lg rounded-circle"
                                                style={{ width: '60px', height: '60px' }}
                                            >
                                                <FaPlay />
                                            </Link>
                                        </div>
                                    </div>
                                    <Card.Body className="d-flex flex-column">
                                        <Card.Title className="h5 mb-2">
                                            {video.title}
                                        </Card.Title>
                                        <Card.Text className="text-muted small flex-grow-1">
                                            {video.description.substring(0, 120)}...
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

                    {/* Pagination */}
                    {pagination && pagination.pages > 1 && (
                        <div className="d-flex justify-content-center mt-5">
                            <nav>
                                <ul className="pagination">
                                    <li className={`page-item ${pagination.page === 1 ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(pagination.page - 1)}
                                            disabled={pagination.page === 1}
                                        >
                                            Previous
                                        </button>
                                    </li>
                                    
                                    {[...Array(pagination.pages)].map((_, index) => {
                                        const page = index + 1;
                                        return (
                                            <li
                                                key={page}
                                                className={`page-item ${pagination.page === page ? 'active' : ''}`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => handlePageChange(page)}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        );
                                    })}
                                    
                                    <li className={`page-item ${pagination.page === pagination.pages ? 'disabled' : ''}`}>
                                        <button
                                            className="page-link"
                                            onClick={() => handlePageChange(pagination.page + 1)}
                                            disabled={pagination.page === pagination.pages}
                                        >
                                            Next
                                        </button>
                                    </li>
                                </ul>
                            </nav>
                        </div>
                    )}
                </>
            ) : (
                <div className="text-center py-5">
                    <i className="fas fa-video fa-3x text-muted mb-3"></i>
                    <h3 className="text-muted">No videos found</h3>
                    <p className="text-muted">
                        {difficultyFilter 
                            ? `No ${difficultyFilter} level videos in this category.`
                            : 'This category doesn\'t have any videos yet.'
                        }
                    </p>
                    {difficultyFilter && (
                        <Button
                            variant="outline-primary"
                            onClick={() => setDifficultyFilter('')}
                        >
                            Clear Filter
                        </Button>
                    )}
                </div>
            )}
        </Container>
    );
};

export default TrainingCategory;
