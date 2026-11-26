const Router = require('restify-router').Router;
const router = new Router();



const Room = require('../models/room');
const { authenticated } = require('./authenticate');


router.get('/room', async (req, res) => {
    const result = await Room.all();

    res.send({
        rooms: result
    });
});



router.get('/room/:id', async (req, res) => {
    const id = req.params.id;

    try {
        const { found, data } = await Room.byId(id);

        if (found) {
            res.send({
                success: true,
                code: 200,
                message: "",
                data: data
            });
        } else {
            res.send(404, {
                success: false,
                code: 404,
                message: "Cannot find room with id: " + id
            });
        }
    } catch (error) {
        console.error("Error getting room:", error);

        res.send(500, {
            success: false,
            code: 500,
            message: "Failed to get room"
        });
    }
});


router.post('/room', authenticated, async (req, res) => {
    

    // 3. Kiểm tra quyền admin hoặc manager
    if (req.user.role !== "admin" && req.user.role !== "manager") {
        res.send(403, {
            success: false,
            code: 403,
            message: "Forbidden: insufficient permission"
        });
        return;
    }

    // 4. Nhận và kiểm tra thông tin phòng
    const { name = "", price = 0 } = req.params;

    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        res.send(400, {
            success: false,
            code: 400,
            message: "Invalid room name or price"
        });
        return;
    }

    
    // 5. Thêm phòng thông qua Model
    try {
        await Room.add(name, price);
    } catch (error) {
        console.error("Error inserting room:", error);

        res.send(500, {
            success: false,
            code: 500,
            message: "Failed to add room"
        });
        return;
    }


    // 6. Trả response sau khi INSERT hoàn tất
    res.send({
        success: true,
        code: 200,
        message: "Room added successfully"
    });
});

router.del('/room/:id', authenticated, async (req, res) => {

    // 3. Kiểm tra quyền
    if (req.user.role !== "admin" && req.user.role !== "manager") {
        res.send(403, {
            success: false,
            code: 403,
            message: "Forbidden: insufficient permission"
        });
        return;
    }

    // 4. Lấy và kiểm tra ID phòng
    const id = Number(req.params.id);

    if (!Number.isSafeInteger(id) || id <= 0) {
        res.send(400, {
            success: false,
            code: 400,
            message: "Invalid room ID"
        });
        return;
    }

    
    // 5. Xóa phòng thông qua Model
    let found;

    try {
        found = await Room.remove(id);
    } catch (error) {
        console.error("Error deleting room:", error);

        res.send(500, {
            success: false,
            code: 500,
            message: "Failed to delete room"
        });
        return;
    }


    // 6. Kiểm tra phòng có được xóa hay không


    if (found) {
        res.send({
            success: true,
            code: 200,
            message: "Room deleted successfully"
        });
    } else {
        res.send(404, {
            success: false,
            code: 404,
            message: "Cannot delete room with id: " + id
        });
    }
});

router.patch('/room/:id', authenticated, async (req, res) => {
    // 1. Lấy JWT từ Header
    

    // 3. Kiểm tra quyền
    if (req.user.role !== "admin" && req.user.role !== "manager") {
        res.send(403, {
            success: false,
            code: 403,
            message: "Forbidden: insufficient permission"
        });
        return;
    }

    // 4. Nhận và kiểm tra dữ liệu
    const id = Number(req.params.id);
    const { name = "", price = 0 } = req.body || {};

    if (!Number.isSafeInteger(id) || id <= 0) {
        res.send(400, {
            success: false,
            code: 400,
            message: "Invalid room ID"
        });
        return;
    }

    if (
        typeof name !== "string" ||
        name.trim().length === 0 ||
        typeof price !== "number" ||
        !Number.isFinite(price) ||
        price <= 0
    ) {
        res.send(400, {
            success: false,
            code: 400,
            message: "Invalid room name or price"
        });
        return;
    }

        // 5. Cập nhật phòng thông qua Model
    let found;

    try {
        found = await Room.update(id, name, price);
    } catch (error) {
        console.error("Error updating room:", error);

        res.send(500, {
            success: false,
            code: 500,
            message: "Failed to update room"
        });
        return;
    }

    // 6. Kiểm tra kết quả UPDATE
    if (found) {
        res.send({
            success: true,
            code: 200,
            message: "Room updated successfully"
        });
    } else {
        res.send(404, {
            success: false,
            code: 404,
            message: "Cannot update room with id: " + id
        });
    }
});

module.exports = router;