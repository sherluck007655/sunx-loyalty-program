const express = require('express');
const router = express.Router();
const Product = require('../../models/Product');
const ValidSerial = require('../../models/ValidSerial');
const { protectAdmin } = require('../../middleware/auth');

// Get all products
router.get('/', protectAdmin, async (req, res) => {
  try {
    const { type, isActive, search } = req.query;
    let query = {};
    
    if (type) query.type = type;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { model: { $regex: search, $options: 'i' } },
        { manufacturer: { $regex: search, $options: 'i' } }
      ];
    }
    
    const products = await Product.find(query)
      .sort({ type: 1, name: 1, model: 1 })
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name');
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// Get product by ID
router.get('/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('createdBy', 'name')
      .populate('updatedBy', 'name')
      .populate('pointsHistory.changedBy', 'name');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    res.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// Create new product
router.post('/', protectAdmin, async (req, res) => {
  try {
    const productData = {
      ...req.body,
      createdBy: req.admin.id
    };
    
    const product = new Product(productData);
    await product.save();
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });
  } catch (error) {
    console.error('Error creating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// Update product
router.put('/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // If points are being updated, use the updatePoints method
    if (req.body.points && req.body.points !== product.points) {
      await product.updatePoints(
        req.body.points, 
        req.admin.id, 
        req.body.pointsUpdateReason || 'Points updated by admin'
      );
      delete req.body.points; // Remove from regular update
    }
    
    // Update other fields
    Object.assign(product, req.body);
    product.updatedBy = req.admin.id;
    
    await product.save();
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: product
    });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
});

// Update product points specifically
router.patch('/:id/points', protectAdmin, async (req, res) => {
  try {
    const { points, reason } = req.body;
    
    if (!points || points < 1) {
      return res.status(400).json({
        success: false,
        message: 'Valid points value is required'
      });
    }
    
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.updatePoints(points, req.admin.id, reason);
    
    res.json({
      success: true,
      message: 'Product points updated successfully',
      data: {
        previousPoints: product.pointsHistory[product.pointsHistory.length - 1]?.previousPoints,
        newPoints: points,
        reason: reason
      }
    });
  } catch (error) {
    console.error('Error updating product points:', error);
    res.status(400).json({
      success: false,
      message: 'Error updating product points',
      error: error.message
    });
  }
});

// Delete product (soft delete)
router.delete('/:id', protectAdmin, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Check if product has associated serial numbers
    const serialCount = await ValidSerial.countDocuments({ product: product._id });
    
    if (serialCount > 0) {
      // Soft delete - mark as inactive
      product.isActive = false;
      product.updatedBy = req.admin.id;
      await product.save();
      
      res.json({
        success: true,
        message: `Product deactivated successfully. ${serialCount} serial numbers are associated with this product.`
      });
    } else {
      // Hard delete if no serial numbers
      await Product.findByIdAndDelete(req.params.id);
      
      res.json({
        success: true,
        message: 'Product deleted successfully'
      });
    }
  } catch (error) {
    console.error('Error deleting product:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
});

// Get product types
router.get('/types/list', protectAdmin, async (req, res) => {
  try {
    const types = await Product.distinct('type');
    
    res.json({
      success: true,
      data: types
    });
  } catch (error) {
    console.error('Error fetching product types:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product types',
      error: error.message
    });
  }
});

// Get products by type
router.get('/type/:type', protectAdmin, async (req, res) => {
  try {
    const products = await Product.getByType(req.params.type);
    
    res.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('Error fetching products by type:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by type',
      error: error.message
    });
  }
});

// Bulk update points for multiple products
router.patch('/bulk/points', protectAdmin, async (req, res) => {
  try {
    const { updates, reason } = req.body; // updates: [{ productId, points }]
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Updates array is required'
      });
    }
    
    const results = [];
    
    for (const update of updates) {
      try {
        const product = await Product.findById(update.productId);
        if (product) {
          await product.updatePoints(update.points, req.admin.id, reason || 'Bulk points update');
          results.push({
            productId: update.productId,
            success: true,
            previousPoints: product.pointsHistory[product.pointsHistory.length - 1]?.previousPoints,
            newPoints: update.points
          });
        } else {
          results.push({
            productId: update.productId,
            success: false,
            error: 'Product not found'
          });
        }
      } catch (error) {
        results.push({
          productId: update.productId,
          success: false,
          error: error.message
        });
      }
    }
    
    res.json({
      success: true,
      message: 'Bulk points update completed',
      data: results
    });
  } catch (error) {
    console.error('Error in bulk points update:', error);
    res.status(500).json({
      success: false,
      message: 'Error in bulk points update',
      error: error.message
    });
  }
});

module.exports = router;
