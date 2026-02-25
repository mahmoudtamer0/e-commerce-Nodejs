const Category = require("./category.schema")





const getAllCategories = async (req, res) => {

    try {
        const { limit, page } = req.query
        const skip = (page - 1) * limit
        const categories = await Category.find().skip(skip).limit(limit);

        return res.status(200).json({
            status: "success",
            data: categories.map(categories => ({
                id: categories._id,
                name: categories.name,
            }))
        })
    } catch (err) {
        return res.status(400).json({
            status: "error",
            data: null
        })
    }
}


const addCategory = async (req, res) => {
    try {
        const name = req.body.name

        const cat = new Category({ name })
        await cat.save()

        return res.status(200).json({
            status: "success",
            data: cat
        })

    } catch (err) {
        return res.status(400).json({
            status: "error",
            data: null
        })
    }
}


const updateCategory = async (req, res) => {
    try {
        const catId = req.params.catId
        const name = req.body.name

        const newCat = await Category.findByIdAndUpdate(catId, { name })

        return res.status(200).json({
            status: "success",
            data: newCat
        })

    } catch (err) {
        return res.status(400).json({
            status: "error",
            data: null
        })
    }
}


const deleteCategory = async (req, res) => {
    try {
        const catId = req.params.catId

        const newCat = await Category.findByIdAndDelete(catId)

        return res.status(200).json({
            status: "success",
            data: null
        })

    } catch (err) {
        return res.status(400).json({
            status: "error",
            data: null
        })
    }
}
module.exports = {
    getAllCategories,
    addCategory,
    updateCategory,
    deleteCategory
}