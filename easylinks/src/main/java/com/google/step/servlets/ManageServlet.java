package com.google.step.servlets;

import com.google.step.servlets.ServletHelper;
import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Key;
import com.google.appengine.api.datastore.KeyFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.Query.Filter;
import com.google.appengine.api.datastore.Query.FilterOperator;
import com.google.appengine.api.datastore.Query.FilterPredicate;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.ArrayList;
import java.util.List;

/** Define an easylink object. */
final class EasyLink {
    
  public EasyLink(long id, String shortcut, String url, String email) {
    this.id = id;
    this.shortcut = shortcut;
    this.url = url;
    this.email = email;
  }

  private final long id;
  private final String shortcut;
  private final String url;
  private final String email;
}

/** Servlet responsible for managing links. */
@WebServlet("/data")
public class ManageServlet extends HttpServlet {
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    final String email = ServletHelper.USERSERVICE.getCurrentUser().getEmail();
    // Define a query rule that retreives records based on email and 
    // sorts links in alphabetically by shortcut
    Filter emailFilter =
        new FilterPredicate("email", FilterOperator.EQUAL, email);
    Query query = new Query("Link")
                      .setFilter(emailFilter)
                      .addSort("shortcut", SortDirection.ASCENDING);
    PreparedQuery results = ServletHelper.DEFAULT_DATASTORE_SERVICE.prepare(query);

    // Retrieve all links from datastore
    List<EasyLink> links = new ArrayList<>();
    for (final Entity entity : results.asIterable()) {
      EasyLink link = new EasyLink(entity.getKey().getId(), 
                                   (String) entity.getProperty("shortcut"),  
                                   (String) entity.getProperty("url"),
                                   (String) entity.getProperty("email"));
      links.add(link);
    }

    response.setContentType("application/json;");
    response.getWriter().println(ServletHelper.convertToJson(links));
  }

  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    long id = Long.parseLong(request.getParameter("id"));
    Key linkEntityKey = KeyFactory.createKey("Link", id);
    ServletHelper.DEFAULT_DATASTORE_SERVICE.delete(linkEntityKey);
  }
}