const express = require("express");
const user_authentication = require("../user-authenticator/user-authenticator");
const router = express.Router();
const logger = require("../logs/logger");
const statsd = require("../statsd/statsd");

const {sequelize, User, Assignment} = require("../sequelize");
const { create_table_and_insert_data, authenticateDatabase } = require("../file");

router.use(express.json());
router.use(express.urlencoded({extended: true}));

authenticateDatabase();
let checkDatabaseConnection = async (req, res) => {
    try {
        await sequelize.authenticate();
        await create_table_and_insert_data(sequelize);
        return true;
      } catch (error) {
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("X-Content-Type-Options", "nosniff");
        logger.info("Database Server not available. Restart your Express Server : "+503);
        res.status(503).send({ Status: 503, message: "Database Server not available. Restart your Express Server" });
        return false;
      }
}

router.get("/assignments", async (req, res)=>{
    statsd.increment("GET.v1.assignments");
    if(!checkDatabaseConnection(req, res)) {
        return;
    }
    else {
        if(!req.headers.authorization)
   {
       res.status(401);
       logger.info("Auth token not provided "+401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }
    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        if(req.headers["content-length"]>0) {
            logger.info("Body has some data in get request, which is not valid : "+400);
            res.status(400).send({Status: 400, message:"Please check your headers. Body has some data in get request, which is not valid."});
            return;
        }
        if(Object.keys(req.query).length > 0 ) {
            logger.info("Query Parameters has some data in get request, which is not valid : "+400);
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        let user_id_validated = validation.user;
        try {
            const assignments = await Assignment.findAll({
            // As per Tejas Parikh Current Discussion in Canvas
                //   where: {
            //     user_id: user_id_validated,
            //   },
            });
        
            let result = [];
            assignments.map((assignment)=>{
                let newAssignment = {};
                newAssignment.id = assignment.id;
                newAssignment.name = assignment.name;
                newAssignment.points = assignment.points;
                newAssignment.num_of_attemps = assignment.num_of_attemps;
                newAssignment.deadline = assignment.deadline;
                newAssignment.assignment_created = assignment.assignment_created;
                newAssignment.assignment_updated = assignment.assignment_updated;
                result.push(newAssignment);
            })
            logger.info("All assignments retrieved "+200);
            res.status(200).send(result);
            return;
          } 
          catch (error) {
            console.error(error);
            logger.info("Tables aren't providing information or database could not be providing information."+503);
            res.status(503).send("Tables aren't providing information or database could not be providing information.");
          }
    }
    else {
        if(validation.status == 503) {
            logger.info(validation.message+" : "+503);
            res.status(503);
            res.send({"Status": 503, "Message": validation.message});
            return;    
        }
        else {
            logger.info(validation.message+" : "+401);
            res.status(401);
            res.send({"Status": 401, "Message": validation.message});
            return;
        }
    }
    }
})

router.post("/assignments", async (req, res)=>{
    statsd.increment("POST.v1.assignments");
    if(!checkDatabaseConnection(req, res)) {
        return;
    }
    else {
        if(!req.headers.authorization)
   {
       logger.info("Please provide an Auth token : "+401);
       res.status(401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }
    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        let user_id_validated = validation.user;
        if(Object.keys(req.query).length > 0 ) {
            logger.info("Please check your headers. Query Parameters has some data in get request, which is not valid. "+400);
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        if(Object.keys(req.body).length==0) {
            logger.info("Request Body only Supports JSON format and need to have all fields "+400);
            res.status(400);
            res.send({"Status": 400, "Message": "Request Body only Supports JSON format and need to have all fields"});
            return;
                    }
        let keys = Object.keys(req.body);
        keys.map((key)=>{
        if(!(key=="name" || key=="points" || key=="num_of_attemps" || key=="deadline")) {
            logger.info(key+" is not valid parameter to pass to body : "+400);
            res.status(400);
                res.send({"Status": 400, "Message": key+" is not valid parameter to pass to body"});
                return;
            }
        })
        let values = Object.values(req.body);
        values.map((value)=>{
        if(value==null || value==undefined || value=="") {
            logger.info("One or More Values given in keys of body are not supported : "+400);
            res.status(400);
                res.send({"Status": 400, "Message": "One or More Values given in keys of body are not supported"});
                return;
            }
        })
        try {
            const deadlineDate = new Date(req.body.deadline);
            const currentDate = new Date();
            if(req.body.name.trim()=="" || typeof req.body.name != "string") {
                logger.info("Check your assignment name in body! : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment name in body!"});
                return;
            }
            else if(req.body.points<0 || req.body.points>10 || typeof req.body.points != "number") {
                logger.info("Check your assignment points in body! : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment points in body!"});
                return;
            }
            else if(req.body.num_of_attemps<0 || typeof req.body.num_of_attemps != "number") {
                logger.info("Check your assignment attemps in body! : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment attemps in body!"});
                return;
            }
            else if(isNaN(deadlineDate.getTime()) || deadlineDate <= currentDate) {
                logger.info("Check your assignment deadline in body! - Deadline isn't matching date or deadline is past date : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment deadline in body! - Deadline isn't matching date or deadline is past date"});
                return;
            }
            else {
                const newAssignment = {
                    name: req.body.name,
                    points: req.body.points,
                    num_of_attemps: req.body.num_of_attemps,
                    deadline: new Date(req.body.deadline),
                    user_id: user_id_validated
                  };
                  
                  for (const key in newAssignment) {
                    if (key !== "name" && key !== "points" && key !== "num_of_attemps" && key !== "deadline" && key !== "user_id") {
                      delete newAssignment[key];
                    }
                  }

                const createdAssignment = await Assignment.create(newAssignment);
                console.log(createdAssignment)

                let postResponse = {
                    "id": createdAssignment.id,
                    "name": createdAssignment.name,
                    "points": createdAssignment.points,
                    "num_of_attemps": createdAssignment.num_of_attemps,
                    "deadline": createdAssignment.deadline,
                    "assignment_created": new Date(),
                    "assignment_updated": new Date()
                }
                logger.info("Postman Resppnse for  : "+200);
                res.status(201).send(postResponse);
                return;
            }
        } 
        catch (error) {
            console.error(error);
            logger.info("Tables aren't providing information or database could not be providing information : "+503);
            res.status(503).send("Tables aren't providing information or database could not be providing information.");
        }
    }
    else {
        if(validation.status == 503) {
            logger.info(validation.message+" : "+503);
            res.status(503);
            res.send({"Status": 503, "Message": validation.message});
            return;    
        }
        else {
            logger.info(validation.message+" : "+401);
            res.send({"Status": 401, "Message": validation.message});
            return;
        }
    }
    }
})

router.get("/assignments/:id", async (req, res)=>{
    statsd.increment("GET.v1.assignments.id");
    if(!checkDatabaseConnection(req, res)) {
        return;
    }
    else {
        if(!req.headers.authorization)
   {
       logger.info("Please provide an Auth token. : "+401);
       res.status(401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }
    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        if(req.headers["content-length"]>0) {
            logger.info("Please check your headers. Body has some data in get request, which is not valid. : "+400);
            res.status(400).send({Status: 400, message:"Please check your headers. Body has some data in get request, which is not valid."});
            return;
        }
        if(Object.keys(req.query).length > 0 ) {
            logger.info("Please check your headers. Query Parameters has some data in get request, which is not valid. : "+400);
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        let assignment_id = req.params.id;
        let user_id_validated = validation.user;
        // console.log(assignment_id, user_id_validated);
        try {
            const assignments = await Assignment.findAll({
              where: {
                user_id: user_id_validated,
                id: assignment_id
              },
            });

            if(assignments.length>0) {
                    let result = [];
                    assignments.map((assignment)=>{
                    let newAssignment = {};
                    newAssignment.id = assignment.id;
                    newAssignment.name = assignment.name;
                    newAssignment.points = assignment.points;
                    newAssignment.num_of_attemps = assignment.num_of_attemps;
                    newAssignment.deadline = assignment.deadline;
                    newAssignment.assignment_created = assignment.assignment_created;
                    newAssignment.assignment_updated = assignment.assignment_updated;
                    result.push(newAssignment);
                })
                logger.info(result+" : "+200);
                res.status(200).send(result);
                return;
            }
            else {
                const assignments_check_1 = await Assignment.findAll({
                    where: {
                      id: assignment_id
                    },
                  });
                  console.log(assignments_check_1.length);
                if(assignments_check_1.length != 0) {
                    // res.status(403).send({Status: 403, message: "Forbidden to access others assignemnts!"});
                    // return;
                    // As per Tejas Parikh Current Discussion in Canvas
                    let result = [];
                    assignments_check_1.map((assignment)=>{
                    let newAssignment = {};
                    newAssignment.id = assignment.id;
                    newAssignment.name = assignment.name;
                    newAssignment.points = assignment.points;
                    newAssignment.num_of_attemps = assignment.num_of_attemps;
                    newAssignment.deadline = assignment.deadline;
                    newAssignment.assignment_created = assignment.assignment_created;
                    newAssignment.assignment_updated = assignment.assignment_updated;
                    result.push(newAssignment);
                    })
                    logger.info(result+" : "+200);
                    res.status(200).send(result);
                    return;
                }
                else {
                    logger.info("No Records Found with the given id in your assignments : "+404);
                    res.status(404).send({Status: 404, message: "No Records Found with the given id in your assignments"});
                    return;
                }
            }
            
          } 
          catch (error) {
            console.error(error);
            logger.info("Tables aren't providing information or database could not be providing information. : "+503);
            res.status(503).send("Tables aren't providing information or database could not be providing information.");
          }
    }
    else {
        if(validation.status == 503) {
            logger.info(validation.message+" : "+503);
            res.status(503);
            res.send({"Status": 503, "Message": validation.message});
            return;    
        }
        else {
            logger.info(validation.message+" : "+401);
            res.status(401);
            res.send({"Status": 401, "Message": validation.message});
            return;
        }
    }
    }
})

router.delete("/assignments/:id", async (req, res)=>{
    statsd.increment("DELETE.v1.assignments.id");
    if(!checkDatabaseConnection(req, res)) {
        return;
    }
    else {
        if(!req.headers.authorization)
   {
       logger.info("Please provide an Auth token : "+401);
       res.status(401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }
    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        if(req.headers["content-length"]>0) {
            logger.info("Please check your headers. Body has some data in get request, which is not valid. : "+400);
            res.status(400).send({Status: 400, message:"Please check your headers. Body has some data in get request, which is not valid."});
            return;
        }
        if(Object.keys(req.query).length > 0 ) {
            logger.info("Please check your headers. Query Parameters has some data in get request, which is not valid. : "+400);
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        let assignment_id = req.params.id;
        let user_id_validated = validation.user;
        // console.log(assignment_id, user_id_validated);
        try {
            const assignments = await Assignment.findAll({
              where: {
                user_id: user_id_validated,
                id: assignment_id
              },
            });

            if(assignments.length>0) {
                try {
                    await Promise.all(
                        assignments.map(async (assignment) => {
                        await assignment.destroy();
                      })
                    );
                    logger.info("204 Retreived All Assignments "+204);
                    res.status(204).end();
                    return;
                  } catch (error) {
                    logger.info("Service Unavailable "+503);
                    console.error(error);
                    res.status(503).send({status: 503, message: "Service Unavaialble."});
                  }
            }
            else {
                const assignments_check_1 = await Assignment.findAll({
                    where: {
                      id: assignment_id
                    },
                  });
                if(assignments_check_1.length > 0) {
                    logger.info("Forbidden to delete others assignemnts! "+403);
                    res.status(403).send({Status: 403, message: "Forbidden to delete others assignemnts!"});
                    return;
                }
                else {
                    logger.info("404 Not Found "+404);
                    res.status(404).end();
                    return;
                }
            }
            
          } 
          catch (error) {
            console.error(error);
            logger.info("404 Not Found "+404);
            res.status(404).end();
          }
    }
    else {
        if(validation.status == 503) {
            logger.info(validation.message+" : "+503);
            res.status(503);
            res.send({"Status": 503, "Message": validation.message});
            return;    
        }
        else {
            logger.info(validation.message+" : "+401);
            res.status(401);
            res.send({"Status": 401, "Message": validation.message});
            return;
        }
    }
    }
})

router.put("/assignments/:id", async (req, res)=>{
    statsd.increment("PUT.v1.assignments.id");
    if(!checkDatabaseConnection(req, res)) {
        return;
    }
    else {
        if(!req.headers.authorization)
   {
       logger.info("No Auth Token Provided : "+401);
       res.status(401);
       res.send({"Status": 401, "Message": "Please provide an Auth token."});
       return;
   }

    let validation = await user_authentication(req.headers.authorization);

    if(validation.isValid) {
        if(Object.keys(req.query).length > 0 ) {
            logger.info("Please check your headers. Query Parameters has some data in get request, which is not valid. : "+400);
            res.status(400).send({Status: 400, message:"Please check your headers. Query Parameters has some data in get request, which is not valid."});
            return;
        }
        let assignment_id = req.params.id;
        let user_id_validated = validation.user;
        // console.log(assignment_id, user_id_validated);

        if(Object.keys(req.body).length==0) {
            logger.info("Request Body only Supports JSON format and need to have all fields : "+400);
            res.status(400);
            res.send({"Status": 400, "Message": "Request Body only Supports JSON format and need to have all fields"});
            return;
        }
        let keys = Object.keys(req.body);
        keys.map((key)=>{
            if(!(key=="name" || key=="points" || key=="num_of_attemps" || key=="deadline")) {
                logger.info(key+" is not valid parameter to pass to body : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": key+" is not valid parameter to pass to body"});
                return;
            }
        })
        let values = Object.values(req.body);
        values.map((value)=>{
            if(value==null || value==undefined || value=="") {
                logger.info("One or More Values given in keys of body are not supported : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": "One or More Values given in keys of body are not supported"});
                return;
            }
        })

        try {

            const deadlineDate = new Date(req.body.deadline);
            const currentDate = new Date();
            if(req.body.name.trim()=="" || typeof req.body.name != "string") {
                logger.info("Check your assignment name in body! : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment name in body!"});
                return;
            }
            else if(req.body.points<0 || req.body.points>10 || typeof req.body.points != "number") {
                logger.info("Check your assignment points in body! : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment points in body!"});
                return;
            }
            else if(req.body.num_of_attemps<0 || typeof req.body.num_of_attemps != "number") {
                logger.info("Check your assignment attemps in body! : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment attemps in body!"});
                return;
            }
            else if(isNaN(deadlineDate.getTime()) || deadlineDate <= currentDate) {
                logger.info("Check your assignment deadline in body! - Deadline isn't matching date or deadline is past date : "+400);
                res.status(400);
                res.send({"Status": 400, "Message": "Check your assignment deadline in body! - Deadline isn't matching date or deadline is past date"});
                return;
            }
            else {
                const newAssignment = {
                    name: req.body.name,
                    points: req.body.points,
                    num_of_attemps: req.body.num_of_attemps,
                    deadline: new Date(req.body.deadline),
                    user_id: user_id_validated
                  };
                  
                  for (const key in newAssignment) {
                    if (key !== "name" && key !== "points" && key !== "num_of_attemps" && key !== "deadline" && key !== "user_id") {
                      delete newAssignment[key];
                    }
                  }

                  const assignments = await Assignment.findAll({
                    where: {
                      user_id: user_id_validated,
                      id: assignment_id
                    },
                  });
      
                  if(assignments.length>0) {
                      try {

                        const assignmentToUpdate = await Assignment.findOne({
                        where: {
                            user_id: user_id_validated,
                            id: assignment_id
                        },
                        });
                        if (!assignmentToUpdate) {
                        logger.info("Assignment not found : "+404);
                        res.status(404).send({ "Status": 404, "Message": "Assignment not found" });
                        return;
                        }
                        assignmentToUpdate.name = newAssignment.name;
                        assignmentToUpdate.points = newAssignment.points;
                        assignmentToUpdate.num_of_attemps = newAssignment.num_of_attemps;
                        assignmentToUpdate.deadline = newAssignment.deadline;

                        await assignmentToUpdate.save();
                        logger.info("Assignment updated successfully : "+204);
                        res.status(204).send({ "Status": 204, "Message": "Assignment updated successfully" });
                        return;
                        } catch (error) {
                            logger.info("Tables aren't providing information or database could not be providing information. : "+503);
                            console.error(error);
                            res.status(503).send("Tables aren't providing information or database could not be providing information.");
                        }
                  }
                  else {
                      const assignments_check_1 = await Assignment.findAll({
                          where: {
                            id: assignment_id
                          },
                        });
                      if(assignments_check_1.length > 0) {
                          logger.info("Forbidden to update others assignemnts! : "+403);
                          res.status(403).send({Status: 403, message: "Forbidden to update others assignemnts!"});
                          return;
                      }
                      else {
                          logger.info("No Records Found : "+404);
                          res.status(404).send({Status: 404, message: "No Records Found with "+id+" in your assignments"});
                          return;
                      }
                  }
            }
            
          } 
          catch (error) {
            logger.info("Tables aren't providing information or database could not be providing information : "+503);
            console.error(error);
            res.status(503).send("Tables aren't providing information or database could not be providing information.");
          }
    }
    else {
        if(validation.status == 503) {
            logger.info(validation.message+" : "+503);
            res.status(503);
            res.send({"Status": 503, "Message": validation.message});
            return;    
        }
        else {
            logger.info(validation.message+" : "+401);
            res.status(401);
            res.send({"Status": 401, "Message": validation.message});
            return;
        }
    }
    }
})

module.exports = router;